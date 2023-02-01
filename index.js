const browserObject = require('./browser');
const scraperObject = require('./scraper');
const {handlePromise} = require('./utils');

async function main() 
{  
    let browser, browserPost;
    try 
    {
        [browser, browserPost] = await Promise.all([
            browserObject.startBrowser(),
            browserObject.startBrowser(true, true)
        ]);

        if(browser != null && browserPost != null)
        {
            await Promise.all([
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-binh-duong/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-da-nang/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-khanh-hoa/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-dong-nai/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-hai-phong/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-ba-ria-vung-tau/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-an-giang/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-bac-giang/p1'))
            ]);
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

        if (browserPost) 
        {
            console.log('Đóng trình duyệt post...');

            const [browserPostCloseError, browserPostClose] = await handlePromise(browserPost.close());

            if(browserPostCloseError)
            {
                console.log(`main => browserPost.close() error => ${browserPostCloseError}\n`);
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