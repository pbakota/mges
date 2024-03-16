package rs.lab.mges.engine;

import java.nio.file.Path;

public interface Helpers {

    public static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static Integer tryParseInt(String str) {
        try {
            return Integer.valueOf(str);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public static Path getHere() {
        //var url = Helpers.class.getProtectionDomain().getCodeSource().getLocation();
        //return Path.of(url.getPath()).toAbsolutePath();
        return Path.of("").toAbsolutePath();
    }
}
