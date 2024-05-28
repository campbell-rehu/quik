package helpers

import "fmt"

func Print(s string, p ...any) {
	fmt.Printf(s+"\n", p...)
}

func PrintError(err error) {
	fmt.Printf("error: %s", err.Error())
}
