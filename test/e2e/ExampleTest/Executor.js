const path = require('path');
const applyExtensions = require('./ext');

class Executor {
  browser;
  page;

  promiseFactories = [];

  create({ browser, page, captureDir }) {
    this.captureDir = captureDir;
    this.browser = browser;
    this.page = applyExtensions(page);
    return this;
  }

  appendAll(promiseFactoryDefs = []) {
    promiseFactoryDefs.forEach((d) => this.append(d));
    return this;
  }

  append({ promiseFactoryName, promiseFactory, wailtMilliSecond }) {
    const pf = this.decoratePromiseFactory(
      promiseFactoryName,
      promiseFactory,
      this.promiseFactories.length,
      wailtMilliSecond
    );
    this.promiseFactories.push(pf);
    return this;
  }

  decoratePromiseFactory(
    promiseFactoryName,
    promiseFactory,
    idx,
    wailtMilliSecond
  ) {
    return async () => {
      const behaviorFlag = (await promiseFactory({ ...this })) || {};
      
      /**
       * An options object for switching behavior like either takes screenshots, disable delay, etc.  
       * This should be returned by each tasks.  
       * In a normal process generating code from katalon json def, we don't make builtin codes to return this option,  
       * you can return it as you needed by customizing the target task JS file (so this is optional).
       * 
       * @example `
       * // task/open.0.js
       * module.exports = async ({ browser, page }) => {
       *     await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' })
       *     await page.waitTillHTMLRendered()
       * 
       *     return { disableScreenshot: true }  // <- you would add this line to make the executor disable taking screenshots.
       * }
       * `
       */
      const {
        disableDelay,
        disableScreenshot,
        delayMilliSecond
      } = behaviorFlag;

      if (!disableDelay) {
        const delay = (time = 0) => {
          return new Promise((resolve) => setTimeout(resolve, time));
        };
        await delay(delayMilliSecond || wailtMilliSecond);
      }

      if (!disableScreenshot) {
        const currentDir = path.dirname(__filename).split(path.sep).pop();
        await this.page.screenshot({
          path: `${this.captureDir}${path.sep}capture.${currentDir}.${idx}.${promiseFactoryName}.png`,
          type: 'png',
          fullPage: true,
        });
      }

      console.dir(`promise no.${idx} ${promiseFactoryName} was executed.`);
    };
  }

  async execute() {
    for (const promiseFactory of this.promiseFactories) {
      await promiseFactory();
    }
    console.dir('all promises are executed.');
    await this.browser.close();
  }
}

module.exports = Executor;
