const KEEP_ALIVE_INTERVAL_MS = 14 * 60 * 1000;

/**
 * Sends a lightweight request to this app at a fixed interval.
 *
 * Set KEEP_ALIVE_URL to the public backend URL (for example,
 * https://my-api.onrender.com). Render deployments can also use their
 * automatically supplied RENDER_EXTERNAL_URL.
 */
function startKeepAlive() {
  const baseUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;

  if (!baseUrl) {
    console.log('Keep-alive scheduler is disabled: KEEP_ALIVE_URL is not set.');
    return;
  }

  const healthUrl = `${baseUrl.replace(/\/$/, '')}/health`;
  let requestInProgress = false;

  const pingServer = async () => {
    if (requestInProgress) return;

    requestInProgress = true;
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) {
        throw new Error(`Health check returned ${response.status}`);
      }
      console.log(`Keep-alive ping succeeded: ${healthUrl}`);
    } catch (error) {
      console.error(`Keep-alive ping failed: ${error.message}`);
    } finally {
      requestInProgress = false;
    }
  };

  pingServer();
  setInterval(pingServer, KEEP_ALIVE_INTERVAL_MS);
  console.log(`Keep-alive scheduler started: every 14 minutes (${healthUrl}).`);
}

module.exports = startKeepAlive;
