import java.util.*;

public class FakeStockService implements StockService {
  private final Random random = new Random();
  
  public double getPrice(final String ticker) throws Exception {
    System.out.println(Thread.currentThread() + " Getting Price for => " + ticker);
    try {
      Thread.sleep(2000);
    } catch (Exception e) {
    }
    double price = random.nextDouble() * 100;
    System.out.println(Thread.currentThread() + " Returning Price for => " + ticker + " price = " + price);
    return price;
  }
}