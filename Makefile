available:
	@echo "available commands:"
	@echo "run-server - runs the server"
	@echo "run-front-end - runs the front-end app"
run-server:
	cd server && wgo run main.go
run-front-end:
	cd src && npm run start
