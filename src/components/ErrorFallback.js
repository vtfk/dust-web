function ErrorFallback ({ error, resetErrorBoundary }) {
  return (
    <div role='alert'>
      <p>Noe gikk galt</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Prøv igjen</button>
    </div>
  )
}

export default ErrorFallback
