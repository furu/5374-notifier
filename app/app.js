'use strict';

const puppeteer = require('puppeteer');
const IncomingWebhook = require('@slack/client').IncomingWebhook;

const WORD              = process.env.WORD;
const AREA              = process.env.AREA;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_CHANNEL     = process.env.SLACK_CHANNEL;

(async () => {

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto('http://hiroshima.5374.jp/');

  await page.waitFor(5000);

  await page.evaluate((word, area) => {
    const selectGroup = document.querySelector('#select_group');
    selectGroup.value = word;
    selectGroup.dispatchEvent(new Event('change'));

    const selectArea = document.querySelector('#select_area');
    selectArea.value = area;
    selectArea.dispatchEvent(new Event('change'));
  }, WORD, AREA);

  await page.waitForSelector('.left-day');

  const result = await page.evaluate(() => {
    const today = Array.from(document.querySelectorAll('.left-day'))
      .filter((e, i) => e.textContent === '今日')
      .map((e, i) => e.nextElementSibling.children[0].getAttribute('alt'));

    const tomorrow = Array.from(document.querySelectorAll('.left-day'))
      .filter((e, i) => e.textContent === '明日')
      .map((e, i) => e.nextElementSibling.children[0].getAttribute('alt'));

    return { today: today, tomorrow: tomorrow };
  });

  browser.close();

  let message = [];

  if (result.today.length > 0) {
    message.push(`今日は、${result.today.join('と')}です。`);
  } else {
    message.push('今日は、ごみの回収はありません。');
  }

  if (result.tomorrow.length > 0) {
    message.push(`明日は、${result.tomorrow.join('と')}です。`);
  } else {
    message.push('明日は、ごみの回収はありません。');
  }

  const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL, {
    username: '5374-bot',
    iconEmoji: ':wastebasket:',
    channel: SLACK_CHANNEL
  });

  webhook.send(message.join("\n"), (err, _) => {
    if (err) {
      console.log('Error:', err);
    }
  });

})();
