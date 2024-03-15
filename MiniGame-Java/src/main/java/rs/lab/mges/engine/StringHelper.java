package rs.lab.mges.engine;

public interface StringHelper {

    public static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}
