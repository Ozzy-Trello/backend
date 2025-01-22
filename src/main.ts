import 'module-alias/register';
import { Server } from "./server";

const app = new Server();
app.checkDependencies().then(() => app.start()).catch((error) => {
    console.error(error);
    process.exit(1);
});
