const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const {executablePath} = require('puppeteer');
const configs = require('./configs');
const {handlePromise} = require('./utils');

puppeteer.use(pluginStealth());

async function startBrowser(headless, devtools)
{
    let browser;
	try 
    {
	    console.log('Khởi chạy trình duyệt...');

        const [startBrowserError, browserData] = 
            await handlePromise(puppeteer.launch({
                headless: headless || true,
                devtools: devtools || true,
                executablePath: configs.executablePath || executablePath(),
                ignoreHTTPSErrors: true
            }));

        if(startBrowserError)
        {
            console.log(`startBrowser error => ${startBrowserError}\n`);
            browser = null;
        }
        else
        {
            browser = browserData;
        }
	} 
	catch (error) 
	{
	    console.log(`Không thể khởi chạy trình duyệt => error => ${error.message}\n stack trace => ${error.stack}\n`);
	}

	return browser;
}

module.exports = {
	startBrowser
};