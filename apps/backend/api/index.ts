/**
 * Serverless entrypoint.
 *
 * A serverless runtime owns the server and hands each request to a handler, so
 * it needs the app exported rather than started. Express apps are themselves
 * `(req, res)` handlers, which is why this is a re-export and not an adapter.
 *
 * Safe to run serverless because this service holds no state worth keeping: the
 * only thing cached in memory is an admin token, and it re-authenticates when
 * that is rejected. The loyalty platform behind it is a different matter — see
 * docs/deployment.md.
 */
import { finalize } from '../src/app.js';

// No studio router here — it is the only thing that pulls in the Anthropic SDK,
// and the member app and till do not need it.
export default finalize();
