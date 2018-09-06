import java.util.*;
import java.util.stream.*;
import java.util.concurrent.*;

public class Portfolio {
  private Map<String, Integer> stocks = new HashMap<>();
  
  public void add(String ticker, Integer qty) {
    int oldQty = 0;
    if (stocks.containsKey(ticker)) {
      oldQty = stocks.get(ticker);
    }
    stocks.put(ticker, oldQty + qty);
  }
	
  public Double netWorth(StockService stockService) throws Exception {
    System.out.println("Stocks = " + stocks);
    // ForkJoinPool pool = new ForkJoinPool(10);
      // Future<Double> worth = pool.submit(() -> {
        long startTime = System.currentTimeMillis();
        List<Double> prices = stocks.entrySet()
    			.stream()
          // comment or uncomment the parallel() call below and see the difference
        .parallel()
  			.collect(ArrayList<Double>::new, (acc, entry) -> {
          String ticker = entry.getKey();
          try {
            acc.add(stockService.getPrice(ticker) * entry.getValue());  
          } catch (Exception e) {
            e.printStackTrace();
          }
        }, ArrayList::addAll);
        long timeTaken = System.currentTimeMillis() - startTime;
        System.out.println(String.format("It took %d (ms)", timeTaken));
        return prices.stream().reduce(0d, (a, e) -> a + e);
    //   });
    // pool.shutdown();
    // return worth.get();
  }
  
  public static void main(String[] args) throws Exception {
    Thread.sleep(10000);
    Portfolio portfolio = new Portfolio();
    portfolio.add("GOOG", 10);
    portfolio.add("AAPL", 20);
    portfolio.add("YHOO", 30);
    portfolio.add("MSFT", 40);
    portfolio.add("ORCL", 40);
    portfolio.add("AMZN", 50);
    portfolio.add("GOOG", 90);
    // System.out.println("NetWorth = " + portfolio.netWorth(newFakeStockService()));
    System.out.println("NetWorth = " + portfolio.netWorth(new NationalStockService()));
  }
}