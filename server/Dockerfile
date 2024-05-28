FROM golang:alpine3.19

# Create app directory
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /quik

EXPOSE 5000

CMD [ "/quik" ]
