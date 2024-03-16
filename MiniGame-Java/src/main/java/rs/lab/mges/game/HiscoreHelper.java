package rs.lab.mges.game;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.function.Consumer;
import rs.lab.mges.engine.Helpers;

public interface HiscoreHelper {

    public static void readHiscore(Path path, Consumer<Integer> f) {
        if (Files.exists(path)) {
            String s;
            try {
                s = Files.readString(path);
                var hs = Helpers.tryParseInt(s);
                if (hs != null) {
                    f.accept(hs);
                }
            } catch (IOException ex) {
            }
        }
    }

    public static void writeHiscore(Path path, int hiscore) {
        try {
            Files.writeString(path, String.valueOf(hiscore));
        } catch (IOException ex) {
        }
    }
}
