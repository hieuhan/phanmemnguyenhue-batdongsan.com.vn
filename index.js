const browserObject = require('./browser');
const scraperObject = require('./scraper');
const {handlePromise} = require('./utils');

async function main() 
{  
    let browser;
    try 
    {
        browser = await browserObject.startBrowser();

        if(browser != null)
        {
            scraperObject.urlRequest = 'https://batdongsan.com.vn/nha-dat-ban/p1';
		
            const [scraperError, scraperData] = await handlePromise(scraperObject.scraper(browser));

            if(scraperError)
            {
                console.log(`main => scraperObject.scraper(browser) error => ${scraperError}\n`);
            }
        }
    } 
    catch (error) 
    {
        console.error(`Không thể tạo phiên bản trình duyệt => ${error.message}\n stack trace => ${error.stack}\n`);
    }
    finally
    {
        if (browser) 
        {
            console.log('Đóng trình duyệt...');

            const [browserCloseError, browserClose] = await handlePromise(browser.close());

            if(browserCloseError)
            {
                console.log(`main => browser.close() error => ${browserCloseError}\n`);
            }
        }
    }
}

(async () => 
{
    await main();
})().catch(error => {
    console.error(`main error => ${error.message}\n stack trace => ${error.stack}\n`);
});