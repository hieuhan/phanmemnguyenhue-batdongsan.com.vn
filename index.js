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
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-binh-duong/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-da-nang/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-khanh-hoa/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-dong-nai/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-hai-phong/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-ba-ria-vung-tau/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-an-giang/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-ban-bac-giang/p1'))
                
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-ca-mau/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-can-tho/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-cao-bang/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-dak-lak/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-dak-nong/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-dong-thap/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-gia-lai/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-ha-giang/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-ha-nam/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-ha-tinh/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-hai-duong/p1')),
                handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-hau-giang/p1')),
                
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-hoa-binh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-hung-yen/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-kien-giang/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-kon-tum/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-lam-dong/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-lang-son/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-lao-cai/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-long-an/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-nam-dinh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-nghe-an/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-ninh-binh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-ninh-thuan/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-phu-tho/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-phu-yen/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-quang-binh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-quang-nam/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-quang-ngai/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-quang-ninh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-quang-tri/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-soc-trang/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-son-la/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-tay-ninh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-thai-binh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-thai-nguyen/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-thanh-hoa/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-thua-thien-hue/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-tien-giang/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-tra-vinh/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-tuyen-quang/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-vinh-long/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-vinh-phuc/p1')),
                // handlePromise(scraperObject.scraper(browser, browserPost, 'https://batdongsan.com.vn/nha-dat-cho-thue-yen-bai/p1'))
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