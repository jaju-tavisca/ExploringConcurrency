import java.lang.management.*;
import java.util.*;
 
// Modified the code from
//http://nadeausoftware.com/articles/2008/03/java_tip_how_get_cpu_and_user_time_benchmarking 
public final class ThreadTimes extends Thread
{
    private class Times {
        public String name;
        public long id;
        public long startCpuTime;
        public long startUserTime;
        public long endCpuTime;
        public long endUserTime;
        public long waitedTime;
        public long blockedTime;
        
        private long toMillis(long nanos) {
          return nanos/(1000*1000);
        }
        public String toString() {
          long cpuTimeNanos = endCpuTime - startCpuTime;
          long userTimeNanos = endUserTime - startUserTime;
          long systemTimeNanos = cpuTimeNanos - userTimeNanos;
          return String.format("[%s] CpuTime:%d(ms), UserTime:%d(ms), SystemTime:%d(ms)", name, toMillis(cpuTimeNanos), toMillis(userTimeNanos), toMillis(systemTimeNanos));
          // return String.format("[%s] CpuTime:%d(ms), UserTime:%d(ms), waited (state due to wait()/join()/park):%d(ms), blocked (for monitor lock):%d(ms)", name, toMillis(cpuTimeNanos), toMillis(userTimeNanos), toMillis(systemTimeNanos), waitedTime, blockedTime);
        }
    }
 
    private final long interval;
    private final long threadId;
    private final Map<Long,Times> history = new HashMap<Long,Times>();
 
    /** Create a polling thread to track times. */
    public ThreadTimes(final long interval) {
        super("Thread time monitor");
        this.interval = interval;
        threadId = getId();
        setDaemon(true);
    }
 
    /** Run the thread until interrupted. */
    public void run() {
        while (!isInterrupted()) {
            update();
            try { sleep( interval ); }
            catch ( InterruptedException e ) { break; }
        }
    }
 
    /** Update the hash table of thread times. */
    private void update() {
        final ThreadMXBean bean =
            ManagementFactory.getThreadMXBean();
        bean.setThreadContentionMonitoringEnabled(true);
        final long[] ids = bean.getAllThreadIds();
        final ThreadInfo[] infos = bean.getThreadInfo(ids);
        for (int i = 0; i < ids.length; i++) {
            long id = ids[i];
            if ( id == threadId )
                continue;   // Exclude polling thread
            String name = infos[i].getThreadName();
            if ( name.equals("Reference Handler") )
                continue;
            if ( name.equals("Signal Dispatcher") )
                continue;
            if ( name.equals("Finalizer") )
                continue;
            if ( name.equals("Keep-Alive-Timer") )
                continue;
            
            final long c = bean.getThreadCpuTime(id);
            final long u = bean.getThreadUserTime(id);
            if ( c == -1 || u == -1 )
                continue;   // Thread died
 
            Times times = history.get( id );
            if ( times == null ) {
                times = new Times();
                times.name = infos[i].getThreadName();
                times.id = id;
                times.startCpuTime  = c;
                times.startUserTime = u;
                times.endCpuTime    = c;
                times.endUserTime   = u;
                history.put(id, times);
            } else {
                times.endCpuTime  = c;
                times.endUserTime = u;
                times.waitedTime = infos[i].getWaitedTime();
                times.blockedTime = infos[i].getBlockedTime();
            }
        }
    }
 
    /** Get total CPU time so far in nanoseconds. */
    public long getTotalCpuTime() {
        final Collection<Times> hist = history.values();
        long time = 0L;
        for ( Times times : hist )
            time += times.endCpuTime - times.startCpuTime;
        return time;
    }
 
    /** Get total user time so far in nanoseconds. */
    public long getTotalUserTime() {
        final Collection<Times> hist = history.values();
        long time = 0L;
        for ( Times times : hist )
            time += times.endUserTime - times.startUserTime;
        return time;
    }
 
    /** Get total system time so far in nanoseconds. */
    public long getTotalSystemTime( ) {
        return getTotalCpuTime() - getTotalUserTime();
    }
    
    public void printAllThreadInfo() {
      System.out.println("=========================================================================");
      System.out.println("To exclude the effects of other system activity,");
      System.out.println("we measure application 'SystemTime' and 'UserTime' instead.");
      System.out.println("UserTime => the time spent running your application's own code.");
      System.out.println("SystemTime => the time spent running OS code on behalf of your application (such as for I/O).");
      System.out.println("We often refer to 'CpuTime' as well: It's the total time spent using a CPU for your application.");
      System.out.println("CpuTime = UserTime + SystemTime");               
      System.out.println("=========================================================================");
      System.out.println("Interesting Threads = " + history.size());
      history.entrySet().stream().forEach(entry -> {
        System.out.println(String.format("%3d %s", entry.getKey(), entry.getValue()));
      });
      System.out.println("=========================================================================");
      System.out.println(String.format("Total CpuTime: %d(ms)", getTotalCpuTime()/(1000*1000)));
      System.out.println(String.format("Total UserTime: %d(ms)", getTotalUserTime()/(1000*1000)));
      System.out.println(String.format("Total SystemTime: %d(ms)", getTotalSystemTime()/(1000*1000)));
      System.out.println("=========================================================================");
    }
}