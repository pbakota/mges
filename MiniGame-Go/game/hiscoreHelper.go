package game

import (
	"fmt"
	"os"
	"strconv"
)

func readHiscore(path string, success func(num int32)) {
	if len(path) == 0 {
		return
	}

	dat, err := os.ReadFile(path)
	if err == nil {
		num, err := strconv.Atoi(string(dat))
		if err == nil {
			success(int32(num))
		}
	}
}

func writeHiscore(path string, hiscore int32) {
	if len(path) == 0 {
		return
	}
	d1 := []byte(fmt.Sprint(hiscore))
	os.WriteFile(path, d1, 0644)
}
