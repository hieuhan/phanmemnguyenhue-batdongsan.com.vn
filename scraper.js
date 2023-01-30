const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const userAgent = new UserAgent({ deviceCategory: 'desktop' });
const configs = require('./configs');
const db_helpers = require('./db_helpers');
const utils = require('./utils');

const scraperObject = 
{
    async scraper(browser, urlRequest)
    {
        try 
        {
            if (!utils.urlRequestIsValid(urlRequest)) 
            {
                await this.scrapeLog({
                    Path: urlRequest,
                    Message: 'Url không hợp lệ'
                });

                return;
            }

            let page = await browserNewPage(browser);

            if(page)
            {
                if(await pageSetUserAgent(page))
                {
                    const currentPage = utils.urlRequestGetCurrentPage(urlRequest);
                    
                    console.log(`Truy cập trang => ${currentPage} => danh sách bài đăng => \n ${urlRequest}\n`);

                    if(await pageGoto(page, urlRequest))
                    {
                        await this.scrapeLog({
                            Path: urlRequest,
                            Message: `Truy cập trang => ${currentPage}`
                        });

                        await waitForTimeout(page);

                        await scrapeCurrentPage(urlRequest);

                    }
                }
            }

            async function scrapeCurrentPage(pageUrl)
            {
                try 
                {
                    if(await waitForSelector(page, '.re__main-content'))
                    {
                        const $ = await loadContent(page);

                        if($)
                        {
                            let dataItems = [];
            
                            const cardFullWebElement = $('.re__srp-list .js__card-full-web');

                            //loc danh sach link va image
                            if(cardFullWebElement.length > 0)
                            {
                                cardFullWebElement.each(function(index, element)
                                {
                                    let item = {};

                                    const productLinkElement = $(element).find('a.js__product-link-for-product-id').first();
                                    
                                    if(productLinkElement.length > 0)
                                    {
                                        const productLinkElementData = productLinkElement.attr('href');

                                        if(productLinkElementData)
                                        {
                                            item.ProductUrl = utils.getProductUrl(productLinkElementData.trim());
                                            
                                            const cardImageElement = $(element).find('.re__card-image > img').first();

                                            if(cardImageElement.length > 0)
                                            {
                                                const cardImageElementData = cardImageElement.attr('src') || cardImageElement.attr('data-src');
                                                
                                                if(cardImageElementData)
                                                {
                                                    item.ImagePath = cardImageElementData.trim();
                                                }
                                            }
                                            
                                            dataItems.push(item);
                                        }
                                    }
                                })
                            }

                            //xu ly link chi tiet trong danh sach tin dang
                            let pagePromise = (pageUrl, productUrl, imagePath) => new Promise(async (resolve, reject) => {
                                try 
                                {
                                    let dataObj = {};

                                    let newPage = await browserNewPage(browser);

                                    if(newPage)
                                    {
                                        if(await pageSetUserAgent(newPage))
                                        {
                                            console.log(`Truy cập bài đăng => \n${productUrl}\n`);

                                            if(await pageGoto(newPage, productUrl))
                                            {
                                                await waitForTimeout(newPage);

                                                if(await waitForSelector(newPage, '.re__main-content-layout'))
                                                {
                                                    const [hiddenPhoneNumbersError, hiddenPhoneNumbers] = await utils.handlePromise(newPage.$$('.re__main-content .hidden-mobile.hidden-phone.m-cover.js__btn-tracking'));

                                                    if(hiddenPhoneNumbersError)
                                                    {
                                                        console.log(`pagePromise => get hiddenPhoneNumbers error => ${hiddenPhoneNumbersError}\n`);
                                                    }
                                                    else
                                                    {
                                                        if(hiddenPhoneNumbers.length > 0)
                                                        {
                                                            await waitForTimeout(newPage);
    
                                                            let decryptPhoneNumbersExists = [];
   
                                                            for (const element of hiddenPhoneNumbers)
                                                            {
                                                                retryDecryptPhone = 0;

                                                                const [rawError, raw] = await utils.handlePromise(newPage.evaluate(el => el.getAttribute('raw'), element));
    
                                                                if(rawError)
                                                                {
                                                                    console.log(`pagePromise => hiddenPhoneNumbers error => ${rawError}\n`);
                                                                }
                                                                else
                                                                {
                                                                    if(!decryptPhoneNumbersExists.includes(raw))
                                                                    {
                                                                        await decryptPhoneNumber(newPage, element, pageUrl, productUrl);
    
                                                                        decryptPhoneNumbersExists.push(raw);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        else
                                                        {
                                                            console.log(`Nội dung bài đăng => ${productUrl} => không chứa số điện thoại ẩn.\n`);
                                                        }
                                                    }

                                                    dataObj = await parserData(newPage, pageUrl, productUrl, imagePath);
                                                }
                                            }

                                            resolve(dataObj);

                                            await pageClose(newPage, productUrl);
                                        }
                                    }
                                } 
                                catch (error) 
                                {
                                    await scraperObject.logError('pagePromise', error, pageUrl, productUrl);
                                }
                            });

                            for(index in dataItems)
                            {
                                await pagePromise(pageUrl, dataItems[index].ProductUrl, dataItems[index].ImagePath);
                            }

                            //link phan trang
                            let nextButton = $('.re__pagination-icon > .re__icon-chevron-right--sm').first();
                            let nextButtonExist = false;

                            if(nextButton.length > 0)
                            {
                                nextButtonExist = true;
                            }

                            if(nextButtonExist)
                            {
                                const nextButtonParent = nextButton.closest('.re__pagination-icon');

                                if(nextButtonParent.length > 0)
                                {
                                    const nextButtonParentHref = nextButtonParent.attr('href');

                                    if(nextButtonParentHref)
                                    {
                                        const nextUrl = utils.getProductUrl(nextButtonParentHref);

                                        const nextPage = utils.urlRequestGetCurrentPage(nextButtonParentHref);
                    
                                        console.log(`Truy cập trang => ${nextPage} => danh sách bài đăng => \n ${nextUrl}\n`);

                                        if(await pageGoto(page, nextUrl))
                                        {
                                            await scraperObject.scrapeLog({
                                                Path: nextUrl,
                                                Message: `Truy cập trang => ${nextPage}`
                                            });

                                            return scrapeCurrentPage(nextUrl);
                                        }
                                    }
                                }
                            }

                            //đóng page
                            await pageClose(page, pageUrl);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('scrapeCurrentPage', error, pageUrl, null);
                }
            }

            async function decryptGetPhoneNumber(page, element, pageUrl, productUrl)
            {
                let resultVar = '';

                try 
                {
                    const [phoneNumberError, phoneNumber] = await utils.handlePromise(page.evaluate(el => el.innerText, element));

                    if(phoneNumberError)
                    {
                        console.log(`decryptGetPhoneNumber => error => ${phoneNumberError}\n`);
                    }
                    else 
                    {
                        resultVar = phoneNumber;
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('decryptGetPhoneNumber', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function decryptPhoneNumber(page, element, pageUrl, productUrl)
            {
                try 
                {
                    let phoneNumber = await utils.handlePromise(decryptGetPhoneNumber(page, element, pageUrl, productUrl));

                    if(phoneNumber.length > 0)
                    {
                        retryDecryptPhone++;

                        console.log(`Xử lý số điện thoại => ${phoneNumber}\n => ẩn trong nội dung bài đăng\n => ${productUrl}\n`);

                        let xhrDecryptPhoneCatcher = page.waitForResponse(r => r.request().url().includes(configs.decryptPhoneUrl) && r.request().method() != 'OPTIONS');
    
                        const [elementClickError, elementClick] = await utils.handlePromise(page.evaluate(e => e.click(), element));
    
                        if(elementClickError)
                        {
                            console.log(`decryptPhoneNumber => click => ${phoneNumber} => error => ${elementClickError}\n`);
                        }
                        else
                        {
                            if(await waitForSelector(page, '.hidden-mobile.hidden-phone.m-cover.js__btn-tracking.m-uncover'))
                            {
                                const [xhrDecryptPhoneResponseError, xhrDecryptPhoneResponse] = await utils.handlePromise(xhrDecryptPhoneCatcher);
    
                                if(xhrDecryptPhoneResponseError)
                                {
                                    console.log(`xhrDecryptPhoneCatcher => ${phoneNumber} => error => ${xhrDecryptPhoneResponseError}\n`);
                                }
                                else
                                {
                                    const [xhrDecryptPhonePayloadError, xhrDecryptPhonePayload] = await utils.handlePromise(xhrDecryptPhoneResponse.text());
        
                                    if(xhrDecryptPhonePayloadError)
                                    {
                                        console.log(`xhrDecryptPhonePayload => ${phoneNumber} => error => ${xhrDecryptPhonePayloadError}\n`);
                                    }
                                    else
                                    {
                                        console.log(`Hiển thị được số điện thoại => ${xhrDecryptPhonePayload}\n`);
                                    }
                                }
                            }
                            else
                            {
                                //reload page
                                console.log(`decryptPhoneNumber => ${phoneNumber} => page reload => ${pageUrl} => ${productUrl}\n`);

                                await scraperObject.scrapeLog({
                                    Path: pageUrl,
                                    DetailPath: productUrl,
                                    Message: `decryptPhoneNumber => ${phoneNumber} => page reload`
                                });

                                await waitForSelector(page);

                                if(await waitForSelector(page))
                                {
                                    await pageReload(page);
                                }
                            }
    
                            await waitForTimeout(page);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('decryptPhoneNumber', error, pageUrl, productUrl);
                }
            }

            async function parserData(page, pageUrl, productUrl, imagePath)
            {
                let resultVar = [];
                try 
                {
                    const $ = await loadContent(page);

                    if($)
                    {
                        const [actionTypeId, productTypeId, landTypeId, investorId, provinceId, customerId] = await Promise.all([
                            parserActionType(page, $, pageUrl, productUrl),
                            parserProductType(page, $, pageUrl, productUrl),
                            parserLandType(page, $, pageUrl, productUrl),
                            parserInvestor(page, $, pageUrl, productUrl),
                            parserProvince(page, $, pageUrl, productUrl),
                            parserCustomer(page, $, pageUrl, productUrl)
                        ]);

                        if(provinceId > 0)
                        {
                            resultVar.DistrictId = await parserDistrict(page, $, provinceId, pageUrl, productUrl);

                            if(resultVar.DistrictId > 0)
                            {
                                resultVar.WardId = await parserWards(page, $, provinceId, resultVar.DistrictId, pageUrl, productUrl);

                                if(resultVar.WardId > 0)
                                {
                                    resultVar.StreetId = await parserStreet(page, $, provinceId, resultVar.DistrictId, resultVar.WardId, pageUrl, productUrl);
                                }
                            }

                            resultVar.ProjectId = await parserProject(page, $, (investorId || 0), provinceId, (resultVar.DistrictId || 0), pageUrl, productUrl);
                        }

                        resultVar.ProductId = await parserProduct(page, $, actionTypeId, productTypeId, landTypeId, provinceId, (resultVar.DistrictId || 0), (resultVar.WardId || 0), (resultVar.StreetId || 0), resultVar.ProjectId, customerId, pageUrl, productUrl, imagePath);
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserData', error, pageUrl, productUrl);
                }
            }

            async function parserActionType(page, $, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    let breadcrumbElement = $('.re__breadcrumb').first();

                    if(breadcrumbElement.length > 0)
                    {
                        let breadcrumbs = breadcrumbElement.text().trim().split('/');

                        if(breadcrumbs.length > 0)
                        {
                            const actionTypeName = breadcrumbs[0].trim();

                            if(actionTypeName.length > 0)
                            {
                                let actionType = 
                                {
                                    ActBy: configs.actionBy,
                                    SiteId: configs.siteId,
                                    Name: actionTypeName
                                }
        
                                resultVar = await db_helpers.actionTypeInsert(actionType);
                            }
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserActionType', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserProductType(page, $, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    let productTypeElement = $('.re__pr-config .re__pr-short-info-item:nth-child(3) .value').first();

                    if(productTypeElement.length > 0)
                    {
                        const producTypeName = productTypeElement.text().trim();

                        if(producTypeName.length > 0)
                        {
                            let productType = 
                            {
                                ActBy: configs.actionBy,
                                SiteId: configs.siteId,
                                Name: producTypeName
                            }
    
                            resultVar = await db_helpers.productTypeInsert(productType);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserProductType', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserLandType(page, $, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    let breadcrumbElement = $('.re__breadcrumb').first();

                    if(breadcrumbElement.length > 0)
                    {
                        let breadcrumbs = breadcrumbElement.text().trim().split('/');

                        if(breadcrumbs.length > 3)
                        {
                            const landTypeName = breadcrumbs[3].split('tại')[0].trim().replace('Loại bất động sản khác', 'Bất động sản khác');

                            if(landTypeName.length > 0)
                            {
                                let landType = {
                                    ActBy: configs.actionBy,
                                    SiteId: configs.siteId,
                                    Name: landTypeName
                                }
        
                                resultVar = await db_helpers.landTypeInsert(landType);
                            }
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserLandType', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserInvestor(page, $, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    const projectInfoElement = $('.re__ldp-project-info').first();

                    if(projectInfoElement.length > 0)
                    {
                        const investorIconElement = projectInfoElement.find('.re__icon-office--sm').first();

                        if(investorIconElement.length > 0)
                        {
                            const investorParentElement = investorIconElement.closest('.re__prj-card-config-value');

                            if(investorParentElement.length > 0)
                            {
                                const investorElement = investorParentElement.find('.re__long-text').first();
                                
                                if(investorElement.length > 0)
                                {
                                    const investorName = investorElement.text().trim();

                                    if(investorName.length > 0 && investorName.toLowerCase().indexOf('đang cập nhật') <= 0)
                                    {
                                        const investor = {
                                            ActBy: configs.actionBy,
                                            SiteId: configs.siteId,
                                            Name: investorName
                                        }
                
                                        resultVar = await db_helpers.investorInsert(investor);
                                    }
                                }
                            }
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserInvestor', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserProject(page, $, investorId, provinceId, districtId, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    const projectInfoElement = $('.re__ldp-project-info').first();

                    if(projectInfoElement.length > 0)
                    {
                        let projectName = '', projectStatus = '', imagePath = '',
                            projectPrice = '', projectArea = '', projectApartment = 0, projectBuilding = 0;

                        const projectTitleElement = projectInfoElement.find('.re__project-title').first();

                        if(projectTitleElement.length > 0)
                        {
                            projectName = projectTitleElement.text().trim();
                        }

                        if(projectName.length > 0)
                        {
                            //ảnh dự án
                            const sectionAvatarElement = projectInfoElement.find('.re__section-avatar').first();

                            if(sectionAvatarElement.length > 0)
                            {
                                const imagePathElement = sectionAvatarElement.find('img').first();

                                if(imagePathElement.length > 0)
                                {
                                    const imageSource = imagePathElement.attr('src') || imagePathElement.attr('data-src');

                                    if(imageSource && imageSource.trim().length > 0)
                                    {
                                        imagePath = imageSource.trim();
                                    }
                                }
                            }


                            //trạng thái
                            const iconInfoElement = projectInfoElement.find('.re__icon-info-circle--sm').first();

                            if(iconInfoElement.length > 0)
                            {
                                const iconInfoParentElement = iconInfoElement.closest('.re__prj-card-config-value');

                                if(iconInfoParentElement.length > 0)
                                {
                                    const iconInfoTextElement = iconInfoParentElement.find('.re__long-text').first();

                                    if(iconInfoTextElement.length > 0)
                                    {
                                        projectStatus = iconInfoTextElement.text().trim();
                                    }
                                }
                            }

                            //khoảng giá
                            const iconMoneyElement = projectInfoElement.find('.re__icon-money--sm').first();

                            if(iconMoneyElement.length > 0)
                            {
                                const iconMoneyParentElement = iconMoneyElement.closest('.re__prj-card-config-value');

                                if(iconMoneyParentElement.length > 0)
                                {
                                    projectPrice = (iconMoneyParentElement.attr('aria-label') || '').trim();
                                }
                            }

                            //khoảng diện tích
                            const iconSizeElement = projectInfoElement.find('.re__icon-size--sm').first();

                            if(iconSizeElement.length > 0)
                            {
                                const iconSizeParentElement = iconSizeElement.closest('.re__prj-card-config-value');

                                if(iconSizeParentElement.length > 0)
                                {
                                    projectArea = (iconSizeParentElement.attr('aria-label') || '').trim();
                                }
                            }

                            //căn hộ
                            const iconHomeElement = projectInfoElement.find('.re__icon-home--sm').first();

                            if(iconHomeElement.length > 0)
                            {
                                const iconHomeParentElement = iconHomeElement.closest('.re__prj-card-config-value');

                                if(iconHomeParentElement.length > 0)
                                {
                                    try 
                                    {
                                        const iconHomeParentElementData = (iconHomeParentElement.attr('aria-label') || '0').replace(/[^0-9.,]/gm,'').replace(',','.').trim();
                                        
                                        if(iconHomeParentElementData.length > 0)
                                        {
                                            projectApartment = parseFloat(iconHomeParentElementData);
                                        }
                                    } 
                                    catch (error) 
                                    {
                                        await scraperObject.logError(`Dự án => ${projectName} => ${productUrl} => Apartment`, error, pageUrl, productUrl);
                                    }
                                }
                            }

                            //tòa nhà
                            const iconBuildingElement = projectInfoElement.find('.re__icon-building--sm').first();

                            if(iconBuildingElement.length > 0)
                            {
                                const iconBuildingParentElement = iconBuildingElement.closest('.re__prj-card-config-value');

                                if(iconBuildingParentElement.length > 0)
                                {
                                    try 
                                    {
                                        const projectBuildingData = (iconBuildingParentElement.attr('aria-label') || '0').replace(/[^0-9.,]/gm,'').replace(',','.').trim();
                                        
                                        if(projectBuildingData.length > 0)
                                        {
                                            projectBuilding = parseFloat(projectBuildingData);
                                        }
                                    } 
                                    catch (error) 
                                    {
                                        await scraperObject.logError(`Dự án => ${projectName} => ${productUrl} => Building`, error, pageUrl, productUrl);
                                    }
                                }
                            }

                            const project = {
                                ActBy: configs.actionBy,
                                SiteId: configs.siteId,
                                InvestorId: investorId,
                                ProvinceId: provinceId,
                                DistrictId: districtId,
                                Name: projectName,
                                Description: null,
                                ImagePath: imagePath,
                                PriceFrom: null,
                                PriceTo: null,
                                ComputedPriceFrom: null,
                                ComputedPriceTo: null,
                                PriceDisplay: null,
                                AreaFrom: null,
                                AreaTo: null,
                                ComputedAreaFrom: null,
                                ComputedAreaTo: null,
                                AreaDisplay: null,
                                Apartments: projectApartment,
                                Buildings: projectBuilding,
                                Status: projectStatus
                            }

                            if(projectPrice.length > 0)
                            {
                                project.PriceDisplay = projectPrice;

                                if(projectPrice.indexOf('-') != -1)
                                {
                                    const projectPriceSplit = projectPrice.split('-');

                                    let projectPriceFactor = 1;

                                    const projectPriceLowerCase = projectPrice.toLowerCase();

                                    if(projectPriceLowerCase.indexOf('nghìn') != -1 || projectPriceLowerCase.indexOf('ngìn') != -1 || projectPriceLowerCase.indexOf('ngàn') != -1)
                                    {
                                        projectPriceFactor = 1000;
                                    }
                                    else if(projectPriceLowerCase.indexOf('triệu') != -1)
                                    {
                                        projectPriceFactor = 1000000;
                                    }
                                    else if(projectPriceLowerCase.indexOf('tỷ') != -1 || projectPriceLowerCase.indexOf('tỉ') != -1)
                                    {
                                        projectPriceFactor = 1000000000;
                                    }

                                    try 
                                    {
                                        const priceFromClean = projectPriceSplit[0].replace(/[^0-9.,]/gm,'').replace(',','.').trim();
                                        
                                        if(priceFromClean.length > 0)
                                        {
                                            project.PriceFrom = parseFloat(priceFromClean);

                                            project.ComputedPriceFrom = project.PriceFrom * projectPriceFactor;
                                        }
                                    } 
                                    catch (error) 
                                    {
                                        await scraperObject.logError(`Dự án => ${projectName} => ${productUrl} => PriceFrom`, error, pageUrl, productUrl);
                                    }

                                    try 
                                    {
                                        if(projectPriceSplit.length > 1)
                                        {
                                            const priceToClean = projectPriceSplit[1].replace(/[^0-9.,]/gm,'').replace(',','.').trim();

                                            if(priceToClean.length > 0)
                                            {
                                                project.PriceTo = parseFloat(priceToClean);

                                                project.ComputedPriceTo = project.PriceTo * projectPriceFactor;
                                            }
                                        }
                                    } 
                                    catch (error) 
                                    {
                                        await scraperObject.logError(`Dự án => ${projectName} => ${productUrl} => PriceTo`, error, pageUrl, productUrl);
                                    }
                                }
                            }

                            if(projectArea.length > 0)
                            {
                                project.AreaDisplay = projectArea;

                                if(projectArea.indexOf('-') != -1)
                                {
                                    const projectAreaSplit = projectArea.split('-');

                                    let projectAreaFactor = 1;

                                    const projectAreaLowerCase = projectArea.toLowerCase();

                                    if(projectAreaLowerCase.indexOf('triệu') != -1)
                                    {
                                        projectAreaFactor = 1000000;
                                    }
                                    else if(projectAreaLowerCase.indexOf('tỷ') != -1 || projectAreaLowerCase.indexOf('tỉ') != -1)
                                    {
                                        projectAreaFactor = 1000000000;
                                    }

                                    try 
                                    {
                                        const areaFromClean = projectAreaSplit[0].replace(/[^0-9.,]/gm,'').replace(',','.').trim();

                                        if(areaFromClean.length > 0)
                                        {
                                            project.AreaFrom = parseFloat(areaFromClean);

                                            project.ComputedAreaFrom = project.AreaFrom * projectAreaFactor;
                                        }
                                    } 
                                    catch (error) 
                                    {
                                        await scraperObject.logError(`Dự án => ${projectName} => ${productUrl} => AreaFrom`, error, pageUrl, productUrl);
                                    }

                                    try 
                                    {
                                        if(projectAreaSplit.length > 1)
                                        {
                                            const areaToClean = projectAreaSplit[1].replace(/[^0-9.,]/gm,'').replace(',','.').trim();
                                            
                                            if(areaToClean.length > 0)
                                            {
                                                project.AreaTo = parseFloat(areaToClean);

                                                project.ComputedAreaTo = project.AreaTo * projectAreaFactor;
                                            }
                                        }

                                    } 
                                    catch (error) 
                                    {
                                        await scraperObject.logError(`Dự án => ${projectName} => ${productUrl} => AreaTo`, error, pageUrl, productUrl);
                                    }
                                }
                            }
    
                            resultVar = await db_helpers.projectInsert(project);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError(`parserProject(${productUrl})`, error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserProvince(page, $, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    const breadcrumbElement = $('.re__breadcrumb').first();

                    if(breadcrumbElement.length > 0)
                    {
                        const breadcrumbs = breadcrumbElement.text().trim().split('/');

                        if(breadcrumbs.length > 1)
                        {
                            const provinceName = breadcrumbs[1].trim();

                            if(provinceName.length > 0)
                            {
                                let province = {
                                    ActBy: configs.actionBy,
                                    SiteId: configs.siteId,
                                    Name: provinceName
                                }
        
                                resultVar = await db_helpers.provinceInsert(province);
                            }
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserProvince', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserDistrict(page, $, provinceId, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    const breadcrumbElement = $('.re__breadcrumb').first();

                    if(breadcrumbElement.length > 0)
                    {
                        const breadcrumbs = breadcrumbElement.text().trim().split('/');

                        if(breadcrumbs.length > 2)
                        {
                            const districtName = breadcrumbs[2].trim();

                            if(districtName.length > 0)
                            {
                                let district = {
                                    ActBy: configs.actionBy,
                                    SiteId: configs.siteId,
                                    ProvinceId: provinceId,
                                    Name: districtName
                                }
        
                                resultVar = await db_helpers.districtInsert(district);
                            }
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserDistrict', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserWards(page, $, provinceId, districtId, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    const addressElement = $('.js__product-detail-web .js__pr-address').first();

                    if(addressElement.length > 0)
                    {
                        let wardName = '';

                        const addressArray = addressElement.text().split(',');
                        
                        addressArray.forEach(element => {
                            if(element.trim().startsWith('Phường') || element.trim().startsWith('Xã') || element.trim().startsWith('Thị trấn')
                            || element.trim().startsWith('phường') || element.trim().startsWith('xã') || element.trim().startsWith('thị trấn'))
                            {
                                if(wardName.trim().length == 0)
                                {
                                    wardName = element.trim().replace('Phường', '').replace('Xã', '').replace('Thị trấn', '').replace('phường', '').replace('xã', '').replace('thị trấn', '').trim();
                                }
                            }
                        });

                        if(wardName.length > 0)
                        {
                            let wards = {
                                ActBy: configs.actionBy,
                                SiteId: configs.siteId,
                                ProvinceId: provinceId,
                                DistrictId: districtId,
                                Name: wardName
                            }
    
                            resultVar = await db_helpers.wardsInsert(wards);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserWards', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserStreet(page, $, provinceId, districtId, wardId, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    const addressElement = $('.js__product-detail-web .js__pr-address').first();

                    if(addressElement.length > 0)
                    {
                        let streetName = '';

                        const addressArray = addressElement.text().split(',');
                       
                        addressArray.forEach(element => {

                            if(element.indexOf('Đường') != -1 || element.indexOf('đường') != -1)
                            {
                                if(streetName.trim().length == 0)
                                {
                                    if(element.indexOf('Đường') != -1)
                                    {
                                        streetName = element.substring(element.indexOf('Đường') + 'Đường'.length,  element.length).trim();
                                    } 
                                    else if(element.indexOf('đường') != -1)
                                    {
                                        streetName = element.substring(element.indexOf('đường') + 'đường'.length,  element.length).trim();
                                    }
                                }
                            }      
                        });

                        if(streetName.length > 0)
                        {
                            let street = {
                                ActBy: configs.actionBy,
                                SiteId: configs.siteId,
                                ProvinceId: provinceId,
                                DistrictId: districtId,
                                WardId: wardId,
                                Name: streetName
                            }
    
                            resultVar = await db_helpers.streetInsert(street);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserStreet', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserCustomer(page, $, pageUrl, productUrl)
            {
                let resultVar = 0;
                try 
                {
                    const mainSidebarElement = $('.re__main-sidebar').first();

                    if(mainSidebarElement.length > 0)
                    {
                        let fullName = '', phoneNumber = '', email = '', profile = '', avatar = '';

                        const contactNameElement = mainSidebarElement.find('.re__contact-name').first();

                        if(contactNameElement.length > 0)
                        {
                            fullName = (contactNameElement.attr('title') || '').trim();
                        }

                        const linkSmsElement = mainSidebarElement.find('.re__link-sms.link_sms').first();

                        if(linkSmsElement.length > 0)
                        {
                            let linkSmsElementData = linkSmsElement.attr('data-href');

                            if(linkSmsElementData && linkSmsElementData.indexOf('sms://') != -1)
                            {
                                try 
                                {
                                    linkSmsElementData = linkSmsElementData.replace('sms://','').trim();

                                    linkSmsElementData = linkSmsElementData.substring(0, linkSmsElementData.indexOf('/')).replace(/[^0-9]/gm,'').trim();

                                    if(linkSmsElementData.length > 0)
                                    {
                                        phoneNumber = linkSmsElementData;
                                    }
                                } 
                                catch (error) 
                                {
                                    await scraperObject.logError(`${fullName} => extract phone number from link sms`, error, pageUrl, productUrl);
                                }
                            }
                        }

                        const sendEmailElement = mainSidebarElement.find('.email-copy.re__btn.re__btn-se-border--md').first();

                        if(sendEmailElement.length > 0)
                        {
                            const sendEmailElementData = sendEmailElement.attr('data-email');

                            if(sendEmailElementData)
                            {
                                email = sendEmailElementData.trim();
                            }
                        }

                        const contactAvatarElement = mainSidebarElement.find('img.re__contact-avatar').first();

                        if(contactAvatarElement.length > 0)
                        {
                            const avatarSource = contactAvatarElement.attr('src') || contactAvatarElement.attr('data-src');

                            if(avatarSource && avatarSource.trim().length > 0)
                            {
                                avatar = avatarSource.trim();
                            }
                        }

                        const userProfileElement = mainSidebarElement.find('.re__contact-name a').first();

                        if(userProfileElement.length > 0)
                        {
                            const userProfileElementData = userProfileElement.attr('href');

                            if(userProfileElementData)
                            {
                                profile = userProfileElementData.trim();
                            }
                        }

                        if(fullName.length > 0 || phoneNumber.length > 0 || email.length > 0)
                        {
                            let customer = {
                                ActBy: configs.actionBy,
                                SiteId: configs.siteId,
                                FullName: fullName,
                                PhoneNumber: phoneNumber,
                                Email: email,
                                Avatar: avatar,
                                Profile: profile
                            }
    
                            resultVar = await db_helpers.customerInsert(customer);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserCustomer', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function parserProduct(page, $, actionTypeId, productTypeId, landTypeId, provinceId, districtId, wardId, streetId, projectId, customerId, pageUrl, productUrl, imagePath)
            {
                let resultVar = 0;
                try 
                {
                    const productDetailWebElement = $('.js__product-detail-web').first();
                    
                    if(productDetailWebElement.length > 0)
                    {
                        let title = '', productContent = '', area = 0, areaDisplay = '', breadcrumb = '', address = '', price = 0, computedPrice = 0, priceDisplay = '', facadeDisplay = '', facade = 0,
                        wayIn = 0, wayInDisplay = '', houseDirection = '', balconyDirection = '', floors = 0, rooms = 0, toilets = 0, juridical = '', interiors = '',
                        latitude = 0, longitude = 0 , productCode = 0, publishedAt = null, expirationAt = null, verified = 0, isVideo = 0;

                        //tin đã xác thực
                        const iconVerifiedElement = productDetailWebElement.find('.re__icon-verified--sm').first();

                        if(iconVerifiedElement.length > 0)
                        {
                            verified = 1;
                        }

                        const breadcrumbElement = $('.re__breadcrumb.js__breadcrumb').first();

                        if(breadcrumbElement.length > 0)
                        {
                            breadcrumb = breadcrumbElement.text().trim();
                        }

                        const addressElement = productDetailWebElement.find('.re__pr-short-description.js__pr-address').first();

                        if(addressElement.length > 0)
                        {
                            address = addressElement.text().trim();
                        }

                        const productTitleElement = productDetailWebElement.find('.re__pr-title').first();

                        if(productTitleElement.length > 0)
                        {
                            title = productTitleElement.text().trim();

                            let regexTitle = /<span class="hidden-mobile m-on-title m-uncover".*?>(.*?)<\/span>.*?/gm;

                            title = title.replace(regexTitle, '<span class="phone-number">$1</span>');
                        }

                        const detailContentElement = productDetailWebElement.find('.re__detail-content').first();

                        if(detailContentElement.length > 0)
                        {
                            productContent = detailContentElement.html();

                            let regexProductContent = /<span class="hidden-mobile hidden-phone m-cover js__btn-tracking m-uncover".*?>(.*?)<\/span>.*?/gm;

                            productContent = productContent.replace(regexProductContent, '<a href="tel:$1" title="$1" class="phone-number">$1</a>');
                        }

                        const specsContentElement = $('.re__pr-specs-content.js__other-info').first();

                        if(specsContentElement.length > 0)
                        {
                            //diện tích
                            const iconSizeElement = specsContentElement.find('.re__icon-size').first();

                            if(iconSizeElement.length > 0)
                            {
                                const iconSizeParentElement = iconSizeElement.closest('.re__pr-specs-content-item');

                                if(iconSizeParentElement.length > 0)
                                {
                                    const areaItemValueElement = iconSizeParentElement.find('.re__pr-specs-content-item-value').first();

                                    if(areaItemValueElement.length > 0)
                                    {
                                        areaDisplay = areaItemValueElement.text().trim();

                                        if(areaDisplay.length > 0)
                                        {
                                            try 
                                            {
                                                const areaClean = areaDisplay.replace(/[^0-9.,]/gm,'').replace(',','.').trim();

                                                if(areaClean.length > 0)
                                                {
                                                    area = parseFloat(areaClean);
                                                }
                                                
                                            } catch (error) 
                                            {
                                                await scraperObject.logError(`Bài đăng ${title} => Area`, error, pageUrl, productUrl);
                                            }
                                        }
                                    }
                                }
                            }

                            //mức giá
                            const iconMoneyElement = specsContentElement.find('.re__icon-money').first();

                            if(iconMoneyElement.length > 0)
                            {
                                const iconMoneyParentElement = iconMoneyElement.closest('.re__pr-specs-content-item');

                                if(iconMoneyParentElement.length > 0)
                                {
                                    const priceItemValueElement = iconMoneyParentElement.find('.re__pr-specs-content-item-value').first();
                                    
                                    if(priceItemValueElement.length > 0)
                                    {
                                        priceDisplay = priceItemValueElement.text().trim();

                                        if(priceDisplay.length > 0)
                                        {
                                            try 
                                            {
                                                const priceClean = priceDisplay.replace(/[^0-9.,]/gm,'').replace(',','.').trim();

                                                if(priceClean.length > 0)
                                                {
                                                    let priceFactor = 1;
        
                                                    const priceDisplayLowerCase = priceDisplay.toLowerCase();

                                                    if(priceDisplayLowerCase.indexOf('triệu') != -1)
                                                    {
                                                        priceFactor = 1000000;
                                                    }
                                                    else if(priceDisplayLowerCase.indexOf('tỷ') != -1 || priceDisplayLowerCase.indexOf('tỉ') != -1)
                                                    {
                                                        priceFactor = 1000000000;
                                                    }
                                                    
                                                    price = parseFloat(priceClean);

                                                    computedPrice = price * priceFactor;
                                                }
                                            } 
                                            catch (error) 
                                            {
                                                await scraperObject.logError(`Bài đăng ${title} => Price`, error, pageUrl, productUrl);
                                            }
                                        }
                                    }
                                }
                            }

                            //mặt tiền
                            const iconHomeElement = specsContentElement.find('.re__icon-home').first();

                            if(iconHomeElement.length > 0)
                            {
                                const iconHomeParentElement = iconHomeElement.closest('.re__pr-specs-content-item');

                                if(iconHomeParentElement.length > 0)
                                {
                                    const facadeItemValueElement = iconHomeParentElement.find('.re__pr-specs-content-item-value').first();
                                    
                                    if(facadeItemValueElement.length > 0)
                                    {
                                        facadeDisplay = facadeItemValueElement.text().trim();

                                        if(facadeDisplay.length > 0)
                                        {
                                            try 
                                            {
                                                const facadeDisplayClean = facadeDisplay.replace(/[^0-9.,]/gm,'').replace(',','.').trim();
                                                
                                                if(facadeDisplayClean.length > 0)
                                                {
                                                    facade = parseFloat(facadeDisplayClean);
                                                }
                                            } 
                                            catch (error) 
                                            {
                                                await scraperObject.logError(`Bài đăng ${title} => Facade`, error, pageUrl, productUrl);
                                            }
                                        }
                                    }
                                }
                            }

                            //Đường vào
                            const iconRoadElement = specsContentElement.find('.re__icon-road').first();

                            if(iconRoadElement.length > 0)
                            {
                                const iconRoadParent = iconRoadElement.closest('.re__pr-specs-content-item');

                                if(iconRoadParent.length > 0)
                                {
                                    const roadItemValueElement = iconRoadParent.find('.re__pr-specs-content-item-value').first();

                                    if(roadItemValueElement.length > 0)
                                    {
                                        wayInDisplay = roadItemValueElement.text().trim();

                                        if(wayInDisplay.length > 0)
                                        {
                                            try 
                                            {
                                                const wayInDisplayClean = wayInDisplay.replace(/[^0-9.,]/gm,'').replace(',','.').trim();
                                                
                                                if(wayInDisplayClean.length > 0)
                                                {
                                                    wayIn = parseFloat(wayInDisplayClean);
                                                }
                                            } 
                                            catch (error) 
                                            {
                                                await scraperObject.logError(`Bài đăng ${title} => WayIn`, error, pageUrl, productUrl);
                                            }
                                        }
                                    }
                                }
                            }

                            //Hướng nhà
                            const iconFrontViewElement = specsContentElement.find('.re__icon-front-view').first();

                            if(iconFrontViewElement.length > 0)
                            {
                                const iconFrontViewParentElement = iconFrontViewElement.closest('.re__pr-specs-content-item');

                                if(iconFrontViewParentElement.length > 0)
                                {
                                    const houseDirectionItemValueElement = iconFrontViewParentElement.find('.re__pr-specs-content-item-value').first();
                                    
                                    if(houseDirectionItemValueElement.length > 0)
                                    {
                                        houseDirection = houseDirectionItemValueElement.text().trim();
                                    }
                                }
                            }

                            //Hướng ban công
                            const iconPrivateHouseElement = specsContentElement.find('.re__icon-private-house').first();

                            if(iconPrivateHouseElement.length > 0)
                            {
                                const iconPrivateHouseParent = iconPrivateHouseElement.closest('.re__pr-specs-content-item');

                                if(iconPrivateHouseParent.length > 0)
                                {
                                    const balconyDirectionItemValueElement = iconPrivateHouseParent.find('.re__pr-specs-content-item-value').first();
                                    
                                    if(balconyDirectionItemValueElement.length > 0)
                                    {
                                        balconyDirection = balconyDirectionItemValueElement.text().trim();
                                    }
                                }
                            }

                            //Số tầng
                            const iconApartmentElement = specsContentElement.find('.re__icon-apartment').first();

                            if(iconApartmentElement.length > 0)
                            {
                                const iconApartmentParentElement = iconApartmentElement.closest('.re__pr-specs-content-item');

                                if(iconApartmentParentElement.length > 0)
                                {
                                    const apartmentItemValueElement = iconApartmentParentElement.find('.re__pr-specs-content-item-value').first();
                                    
                                    if(apartmentItemValueElement.length > 0)
                                    {
                                        try 
                                        {
                                            const apartmentItemValueElementClean = apartmentItemValueElement.text().replace(/[^0-9]/gm,'').trim();

                                            if(apartmentItemValueElementClean.length > 0)
                                            {
                                                floors = parseInt(apartmentItemValueElementClean);
                                            }
                                        } 
                                        catch (error) 
                                        {
                                            await scraperObject.logError(`Bài đăng ${title} => Floors`, error, pageUrl, productUrl);
                                        }
                                    }
                                }
                            }

                            //Số phòng ngủ
                            const iconBedroomElement = specsContentElement.find('.re__icon-bedroom').first();

                            if(iconBedroomElement.length > 0)
                            {
                                const iconBedroomParentElement = iconBedroomElement.closest('.re__pr-specs-content-item');

                                if(iconBedroomParentElement.length > 0)
                                {
                                    const roomItemValueElement = iconBedroomParentElement.find('.re__pr-specs-content-item-value').first();
                                    
                                    if(roomItemValueElement.length > 0)
                                    {
                                        try 
                                        {
                                            const roomItemValueElementClean = roomItemValueElement.text().replace(/[^0-9]/gm,'').trim();

                                            if(roomItemValueElementClean.length > 0)
                                            {
                                                rooms = parseInt(roomItemValueElementClean);
                                            }
                                        } 
                                        catch (error) 
                                        {
                                            await scraperObject.logError(`Bài đăng ${title} => Rooms`, error, pageUrl, productUrl);
                                        }
                                    }
                                }
                            }

                            //Số toilet
                            const iconBathElement = specsContentElement.find('.re__icon-bath').first();

                            if(iconBathElement.length > 0)
                            {
                                const iconBathParentElement = iconBathElement.closest('.re__pr-specs-content-item');

                                if(iconBathParentElement.length > 0)
                                {
                                    const toiletItemValueElement = iconBathParentElement.find('.re__pr-specs-content-item-value').first();
                                    
                                    if(toiletItemValueElement.length > 0)
                                    {
                                        try 
                                        {
                                            const toiletItemValueElementClean = toiletItemValueElement.text().replace(/[^0-9]/gm,'').trim();
                                            
                                            if(toiletItemValueElementClean.length > 0)
                                            {
                                                toilets = parseInt(toiletItemValueElementClean);
                                            }
                                        } 
                                        catch (error) 
                                        {
                                            await scraperObject.logError(`Bài đăng ${title} => Toilets`, error, pageUrl, productUrl);
                                        }
                                    }
                                }
                            }

                            //Pháp lý
                            const iconDocumentElement = specsContentElement.find('.re__icon-document').first();

                            if(iconDocumentElement.length > 0)
                            {
                                const iconDocumentParentElement = iconDocumentElement.closest('.re__pr-specs-content-item');

                                if(iconDocumentParentElement.length > 0)
                                {
                                    const juridicalItemValueElement = iconDocumentParentElement.find('.re__pr-specs-content-item-value').first();

                                    if(juridicalItemValueElement.length > 0)
                                    {
                                        juridical = juridicalItemValueElement.text().trim();
                                    }
                                }
                            }

                            //Nội thất
                            const iconInteriorElement = specsContentElement.find('.re__icon-interior').first();

                            if(iconInteriorElement.length > 0)
                            {
                                const iconInteriorParentElement = iconInteriorElement.closest('.re__pr-specs-content-item');

                                if(iconInteriorParentElement.length > 0)
                                {
                                    const interiorItemValueElement = iconInteriorParentElement.find('.re__pr-specs-content-item-value').first();

                                    if(interiorItemValueElement.length > 0)
                                    {
                                        interiors = interiorItemValueElement.text().trim();
                                    }
                                }
                            }

                            //vị trí trên bản đồ
                            const productMapElement = $('.re__pr-map').first();

                            if(productMapElement.length > 0)
                            {
                                const productMapIframeElement = productMapElement.find('iframe').first();

                                if(productMapIframeElement.length > 0)
                                {
                                    const productMapIframeData = productMapIframeElement.attr('src') || productMapIframeElement.attr('data-src');

                                    if(productMapIframeData)
                                    {
                                        try 
                                        {
                                            const productMapUrl = new URL(productMapIframeData);
                                            const productMapSearchParams = productMapUrl.searchParams;
                                            const productMapQuery = productMapSearchParams.get('q');
                                            const productMapQueryArray = productMapQuery.split(',');

                                            if(productMapQueryArray.length > 1)
                                            {
                                                latitude = productMapQueryArray[0];
                                                longitude = productMapQueryArray[1];
                                            }

                                        } 
                                        catch (error) 
                                        {
                                            await scraperObject.logError(`Bài đăng ${title} => maps get latitude, longitude`, error, pageUrl, productUrl);
                                        }
                                    }
                                }
                            }

                            //ngày đăng
                            const shortInfoItemFirstElement = $('.re__pr-config .re__pr-short-info-item:nth-child(1) .value').first();

                            if(shortInfoItemFirstElement.length > 0)
                            {
                                const publishedAtSplit = shortInfoItemFirstElement.text().trim().split('/');

                                if(publishedAtSplit.length == 3)
                                {
                                    const [ publishedAtError, publishedAtData] = utils.dateToISOString(publishedAtSplit[0] , publishedAtSplit[1], publishedAtSplit[2]);
                                    
                                    if(publishedAtError)
                                    {
                                        await scraperObject.logError(`Bài đăng => ${title} => PublishedAt`, publishedAtError, pageUrl, productUrl);
                                    }
                                    else
                                    {
                                        publishedAt = publishedAtData;
                                    }
                                }
                            }

                            //ngày hết hạn
                            const shortInfoItemSecondElement = $('.re__pr-config .re__pr-short-info-item:nth-child(2) .value').first();

                            if(shortInfoItemSecondElement.length > 0)
                            {
                                const expirationAtSplit = shortInfoItemSecondElement.text().trim().split('/');

                                if(expirationAtSplit.length == 3)
                                {
                                    const [ expirationAtError, expirationAtData] = utils.dateToISOString(expirationAtSplit[0], expirationAtSplit[1], expirationAtSplit[2]);

                                    if(expirationAtError)
                                    {
                                        await scraperObject.logError(`Bài đăng => ${title} => ExpirationAt`, expirationAtError, pageUrl, productUrl);
                                    }
                                    else 
                                    {
                                        expirationAt = expirationAtData;
                                    }
                                }
                            }

                            //mã tin
                            const shortInfoItemFourthElement = $('.re__pr-config .re__pr-short-info-item:nth-child(4) .value').first();

                            if(shortInfoItemFourthElement.length > 0)
                            {
                                try 
                                {
                                    const shortInfoItemFourthElementClean = shortInfoItemFourthElement.text().replace(/[^0-9]/gm,'').trim();

                                    if(shortInfoItemFourthElementClean.length > 0)
                                    {
                                        productCode = parseInt(shortInfoItemFourthElementClean);
                                    }
                                } 
                                catch (error) 
                                {
                                    await scraperObject.logError(`Bài đăng ${title} => ProductCode`, error, pageUrl, productUrl);
                                }
                            }

                            //tin video
                            const swiperSlideElement = $('ul.swiper-wrapper li.swiper-slide.js__media-item-container');

                            if(swiperSlideElement.length > 0)
                            {
                                for(element of swiperSlideElement)
                                {
                                    const dataFilter = $(element).attr('data-filter');

                                    if(dataFilter && dataFilter.toLowerCase().trim() == 'video')
                                    {
                                        if(isVideo <= 0)
                                        {
                                            isVideo = 1;
                                        }
                                    }
                                }
                            } 
                            
                            let product = {
                                ActBy: configs.actionBy,
                                SiteId: configs.siteId,
                                Title: title,
                                ProductUrl: productUrl,
                                ImagePath: imagePath,
                                ProductCode: productCode,
                                ProductContent: productContent,
                                ProvinceId: provinceId,
                                DistrictId: districtId,
                                WardId: wardId,
                                StreetId: streetId,
                                ProjectId: projectId,
                                CustomerId: customerId,
                                Breadcrumb: breadcrumb,
                                Address: address,
                                Verified: verified,
                                IsVideo: isVideo,
                                Area: areaDisplay,
                                AreaDisplay: areaDisplay,
                                Price: price,
                                PriceDisplay: priceDisplay,
                                ComputedPrice: computedPrice,
                                Facade: facade,
                                FacadeDisplay: facadeDisplay,
                                WayIn: wayIn,
                                WayInDisplay: wayInDisplay,
                                Floors: floors,
                                HouseDirection: houseDirection,
                                BalconyDirection: balconyDirection,
                                Rooms: rooms,
                                Toilets: toilets,
                                Juridical: juridical,
                                Interiors: interiors,
                                ProductTypeId: productTypeId,
                                ActionTypeId: actionTypeId,
                                LandTypeId: landTypeId,
                                Latitude: latitude,
                                Longitude: longitude,
                                PublishedAt: publishedAt,
                                ExpirationAt: expirationAt
                            }
    
                            resultVar = await db_helpers.productInsert(product);
                        }
                    }
                } 
                catch (error) 
                {
                    await scraperObject.logError('parserProduct', error, pageUrl, productUrl);
                }

                return resultVar;
            }

            async function loadContent(page)
            {
                let resultVar;
                try 
                {
                    const [pageContentError, pageContent] = await utils.handlePromise(page.content());

                    if(pageContentError)
                    {
                        console.log(`loadContent => page.content() error => ${pageContentError}\n`);
                    }
                    else
                    {
                        resultVar = cheerio.load(pageContent);
                    }
                } 
                catch (error) 
                {
                    console.error(`page.content error => ${error.message}\n stack trace => ${error.stack}\n`);
                }

                return resultVar;
            }

            async function browserNewPage(browser)
            {
                let pageError, page;
                try 
                {
                    [pageError, page] = await utils.handlePromise(browser.newPage());

                    if(pageError)
                    {
                        console.error(`browserNewPage => pageError error => ${pageError}\n`);
                    }
                } 
                catch (error) 
                {
                    console.error(`browserNewPage error => ${error.message}\n stack trace => ${error.stack}\n`);
                }

                return page;
            }

            async function pageSetUserAgent(page)
            {
                let resultVar = false;
                try 
                {
                    const [pageSetUserAgentError, pageUserAgent] = await utils.handlePromise(page.setUserAgent(userAgent.random().toString()));

                    if(pageSetUserAgentError)
                    {
                        console.error(`pageSetUserAgent error => ${pageSetUserAgentError}\n`);
                    }
                    else
                    {
                        resultVar = true;
                    }
                } 
                catch (error) 
                {
                    console.error(`pageSetUserAgent error => ${error.message}\n stack trace => ${error.stack}\n`);
                }

                return resultVar;
            }

            async function pageGoto(page, path)
            {
                let resultVar = false;
                try 
                {
                    const [pageGotoError, pageGoto] = await utils.handlePromise(page.goto(path , { waitUntil: 'networkidle2', timeout: 0 }));

                    if(pageGotoError)
                    {
                        console.log(`pageGoto('${path}') error => ${pageGotoError}\n`);
                    }
                    else
                    {
                        resultVar = true;
                    }
                } 
                catch (error) 
                {
                    console.error(`pageGoto('${path}') error => ${error.message}\n stack trace => ${error.stack}\n`);
                }

                return resultVar;
            }

            async function pageReload(page)
            {
                let resultVar = false;
                try 
                {
                    const [pageReloadError, pageReload] = await utils.handlePromise(page.reload({  waitUntil: 'networkidle2', timeout: 0 }));

                    if(pageReloadError)
                    {
                        console.log(`pageReload error => ${pageReloadError}\n`);
                    }
                    else
                    {
                        resultVar = true;
                    }
                } 
                catch (error) 
                {
                    console.error(`pageReload error => ${error.message}\n stack trace => ${error.stack}\n`);
                }

                return resultVar;
            }

            async function pageClose(page, path)
            {
                try 
                {
                    const [pageCloseError, pageClose] = await utils.handlePromise(page.close());

                    if(pageCloseError)
                    {
                        console.error(`page.close('${path}') error => ${pageCloseError}\n`);
                    }
                    else
                    {
                        console.log(`Đóng page => ${path}\n`);
                    }
                } 
                catch (error) 
                {
                    console.error(`page.close('${path}') error => ${error.message}\n stack trace => ${error.stack}\n`);
                }
            }

            async function waitForTimeout(page)
            {
                let resultVar = false;
                const randomNumber = utils.getRandomNumber();
                try 
                {
                    console.log(`Đợi xử lý sau => ${randomNumber/1000} giây...\n`);

                    const [waitForTimeoutError, waitForTimeout] = await utils.handlePromise(page.waitForTimeout(randomNumber));

                    if(waitForTimeoutError)
                    {
                        console.log(`waitForTimeout('${randomNumber}') error => ${waitForTimeoutError}\n`);
                    }
                    else
                    {
                        resultVar = true;
                    }
                } 
                catch (error) 
                {
                    console.error(`waitForTimeout('${randomNumber}') error => ${error.message}\n stack trace => ${error.stack}\n`);
                }

                return resultVar;
            }

            async function waitForSelector(page, selector)
            {
                let resultVar = false;
                try 
                {
                    const [pageWaitForSelectorError, pageWaitForSelector] = await utils.handlePromise(page.waitForSelector(selector));

                    if(pageWaitForSelectorError)
                    {
                        console.log(`waitForSelector('${selector}') error => ${pageWaitForSelectorError}\n`);
                    }
                    else
                    {
                        resultVar = true;
                    }
                } 
                catch (error) 
                {
                    console.error(`waitForSelector('${selector}') error => ${error.message}\n stack trace => ${error.stack}\n`);
                }

                return resultVar;
            }
        } 
        catch (error) 
        {
            console.error(`scraper error => ${error.message}\n stack trace => ${error.stack}\n`);
        }
    },
    async scrapeLog(scrapeLog)
    {
        try 
        {
            const [scrapeLogInsertError, data] = 
                    await utils.handlePromise(db_helpers.scrapeLogInsert({
                        ActBy: configs.actionBy,
                        SiteId: configs.siteId,
                        Path: scrapeLog.Path,
                        DetailPath: (scrapeLog.DetailPath || null),
                        Message: (scrapeLog.Message || null)
                    }));

            if(scrapeLogInsertError)
            {
                console.log(`scraperObject => scrapeLogInsert error => ${startBrowserError}\n`);
            }
        } 
        catch (error) 
        {
            console.error(`scrapeLog error => ${error.message}\n stack trace => ${error.stack}\n`);
        }
    },
    async logError(message, error, pageUrl, productUrl)
    {
        try 
        {
            console.error(`${message} error => ${error.message}\n stack trace => ${error.stack}\n`);

            await scraperObject.scrapeLog({
                Path: pageUrl,
                DetailPath: productUrl,
                Message: `${message} error => ${error.message}\n stack trace => ${error.stack}`
            });
        } 
        catch (err) 
        {
            console.error(`logError error => ${err.message}\n stack trace => ${err.stack}\n`);
        }
    }

};

module.exports = scraperObject;