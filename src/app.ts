import 'module-alias/register';
import { app } from '@/app/app';
import { config } from './app/config';

(async () => {
  try {
    app.listen(config.port, async () => {
      console.log(`Server started on port http://localhost:${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
