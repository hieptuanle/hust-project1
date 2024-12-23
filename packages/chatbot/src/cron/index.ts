import schedule from 'node-schedule'
import type { Platform } from '../platforms/Platform';
import type { ZaloPlatform } from '../platforms/Zalo';

export default class Cron {
  constructor(private readonly platforms: Platform[]) { }

  async start() {
    console.log('Starting cron');
    const cron = this;
    schedule.scheduleJob('0 14,2 * * *', async function () {
      console.log('Running cron job: Refresh Zalo Access Token');
      const zalo = cron.platforms.find(platform => platform.id === 'zalo') as ZaloPlatform;
      if (!zalo) {
        console.error('Zalo platform not found');
        return;
      }
      const { accessToken, refreshToken } = await zalo.refreshAccessToken();
      await zalo.updateConfig({ accessToken, refreshToken, });
    });
  }
}
