export {}

// Setting this global type override to allow setting environment variables at runtime via the Docker image
declare global {
  interface Window {
    ENV: {
      REACT_APP_API_URL: string
    }
  }
}
