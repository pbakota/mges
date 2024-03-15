package rs.lab.mges;

import rs.lab.mges.game.RabbitGame;

public class App {

    public static void main(String[] args) {
        System.setProperty("jna.library.path", "lib");
//        System.setProperty("jna.debug_load", "TRUE");
        var rabbit = new RabbitGame();
        rabbit.run();
    }
}
