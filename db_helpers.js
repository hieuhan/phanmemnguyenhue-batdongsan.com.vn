const { poolPromise } = require('./pool');
const sql = require('mssql');
const {handlePromise} = require('./utils');

async function getPool()
{
    const [poolError, pool] = await handlePromise(poolPromise);
        
    if(poolError)
    {
        console.log(`poolPromise error => ${poolError}\n`);
        
        return null;
    }

    return pool;
}

async function actionTypeInsert(actionType)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Hành động => ${actionType.Name}\n`);

        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), actionType.ActBy)  
                    .input("SiteId", sql.Int, actionType.SiteId)  
                    .input("Name", sql.NVarChar(50), actionType.Name)  
                    .input("Description", sql.NVarChar(50), (actionType.Description || null))
                    .output('ActionTypeId', sql.Int)
                    .execute('ActionTypes_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['ActionTypeId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`actionTypeInsert error => ${error}\n`);
    }

    return resultVar;
}

async function productTypeInsert(productType)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Loại tin đăng => ${productType.Name}\n`);
        
        const pool = await getPool();
        
        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), productType.ActBy)  
                    .input("SiteId", sql.Int, productType.SiteId)  
                    .input("Name", sql.NVarChar(50), productType.Name)  
                    .input("Description", sql.NVarChar(50), (productType.Description || null))
                    .output('ProductTypeId', sql.Int)
                    .execute('ProductTypes_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['ProductTypeId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`productTypeInsert error => ${error}\n`);
    }

    return resultVar;
}

async function landTypeInsert(landType)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Loại nhà đất => ${landType.Name}\n`);

        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), landType.ActBy)  
                    .input("SiteId", sql.Int, landType.SiteId)  
                    .input("Name", sql.NVarChar(150), landType.Name)  
                    .input("Description", sql.NVarChar(150), (landType.Description || null))
                    .output('LandTypeId', sql.Int)
                    .execute('LandTypes_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['LandTypeId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`landTypeInsert error => ${error}\n`);
    }

    return resultVar;
}

async function investorInsert(investor)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Chủ đầu tư => ${investor.Name}\n`);

        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), investor.ActBy)  
                    .input("SiteId", sql.Int, investor.SiteId)  
                    .input("Name", sql.NVarChar(150), investor.Name)  
                    .input("Description", sql.NVarChar(150), (investor.Description || null))
                    .output('InvestorId', sql.Int)
                    .execute('Investors_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['InvestorId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`investorInsert error => ${error}\n`);
    }

    return resultVar;
}

async function provinceInsert(province)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Tỉnh / Thành phố => ${province.Name}\n`);
        
        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), province.ActBy)  
                    .input("SiteId", sql.Int, province.SiteId)  
                    .input("Name", sql.NVarChar(150), province.Name)  
                    .input("Description", sql.NVarChar(150), (province.Description || null))
                    .output('ProvinceId', sql.Int)
                    .execute('Provinces_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['ProvinceId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`provinceInsert error => ${error}\n`);
    }

    return resultVar;
}

async function districtInsert(district)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Quận / Huyện => ${district.Name}\n`);
        
        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), district.ActBy)  
                    .input("SiteId", sql.Int, district.SiteId)  
                    .input("ProvinceId", sql.Int, district.ProvinceId)  
                    .input("Name", sql.NVarChar(150), district.Name)  
                    .input("Description", sql.NVarChar(150), (district.Description || null))
                    .output('DistrictId', sql.Int)
                    .execute('Districts_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['DistrictId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`districtInsert error => ${error}\n`);
    }

    return resultVar;
}

async function wardsInsert(wards)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Phường / Xã => ${wards.Name}\n`);

        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), wards.ActBy)  
                    .input("SiteId", sql.Int, wards.SiteId)  
                    .input("ProvinceId", sql.Int, wards.ProvinceId)
                    .input("DistrictId", sql.Int, wards.DistrictId)
                    .input("Name", sql.NVarChar(150), wards.Name)  
                    .input("Description", sql.NVarChar(150), (wards.Description || null))
                    .output('WardId', sql.Int)
                    .execute('Wards_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['WardId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`wardsInsert error => ${error}\n`);
    }

    return resultVar;
}

async function streetInsert(street)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Đường / Phố => ${street.Name}\n`);
        
        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), street.ActBy)  
                    .input("SiteId", sql.Int, street.SiteId)  
                    .input("ProvinceId", sql.Int, street.ProvinceId)
                    .input("DistrictId", sql.Int, street.DistrictId)
                    .input("WardId", sql.Int, street.WardId)
                    .input("Name", sql.NVarChar(150), street.Name)  
                    .input("Description", sql.NVarChar(150), (street.Description || null))
                    .output('StreetId', sql.Int)
                    .execute('Streets_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['StreetId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`streetInsert error => ${error}\n`);
    }

    return resultVar;
}

async function projectInsert(project)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Dự án => ${project.Name}\n`);
        
        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), project.ActBy)  
                    .input("SiteId", sql.Int, project.SiteId)  
                    .input("InvestorId", sql.Int, project.InvestorId)
                    .input("ProvinceId", sql.Int, project.ProvinceId)
                    .input("DistrictId", sql.Int, (project.DistrictId || null))
                    .input("Name", sql.NVarChar(250), project.Name)  
                    .input("Description", sql.NVarChar(250), (project.Description || null))
                    .input("PriceFrom", sql.Float, (project.PriceFrom || null))
                    .input("PriceTo", sql.Float, (project.PriceTo || null))
                    .input("ComputedPriceFrom", sql.Float, (project.ComputedPriceFrom || null))
                    .input("ComputedPriceTo", sql.Float, (project.ComputedPriceTo || null))
                    .input("PriceDisplay", sql.NVarChar(50), project.PriceDisplay)  
                    .input("AreaFrom", sql.Float, (project.AreaFrom || null))
                    .input("AreaTo", sql.Float, (project.AreaTo || null))
                    .input("ComputedAreaFrom", sql.Float, (project.ComputedAreaFrom || null))
                    .input("ComputedAreaTo", sql.Float, (project.ComputedAreaTo || null))
                    .input("AreaDisplay", sql.NVarChar(50), (project.AreaDisplay || null)) 
                    .input("Apartments", sql.Int, (project.Apartments || null))
                    .input("Buildings", sql.Int, (project.Buildings || null))
                    .input("Status", sql.NVarChar(250), (project.Status || null))  
                    .output('ProjectId', sql.Int)
                    .execute('Projects_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['ProjectId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`projectInsert error => ${error}\n`);
    }

    return resultVar;
}

async function customerInsert(customer)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu Khách hàng => ${customer.FullName} / ${customer.PhoneNumber}\n`);
        
        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), customer.ActBy)  
                    .input("SiteId", sql.Int, customer.SiteId)  
                    .input("FullName", sql.NVarChar(250), (customer.FullName || null))
                    .input("PhoneNumber", sql.NVarChar(50), (customer.PhoneNumber || null))
                    .input("Email", sql.NVarChar(150), (customer.Email || null))
                    .input("Avatar", sql.NVarChar(2000), (customer.Avatar || null))
                    .input("Profile", sql.NVarChar(500), (customer.Profile || null))
                    .output('CustomerId', sql.Int)
                    .execute('Customers_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['CustomerId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`customerInsert error => ${error}\n`);
    }

    return resultVar;
}

async function productInsert(product)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý dữ liệu tin đăng => ${product.Title}\n`);
        
        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), product.ActBy)  
                    .input("SiteId", sql.Int, product.SiteId)  
                    .input("ProvinceId", sql.Int, product.ProvinceId)
                    .input("DistrictId", sql.Int, product.DistrictId)
                    .input("WardId", sql.Int, product.WardId)
                    .input("StreetId", sql.Int, product.StreetId)
                    .input("Title", sql.NVarChar(500), product.Title)  
                    .input("ProductUrl", sql.NVarChar(255), product.ProductUrl)
                    .input("ImagePath", sql.NVarChar(2000), (product.ImagePath || null))
                    .input("ProductCode", sql.Int, (product.ProductCode || null))
                    .input("ProductContent", sql.NVarChar(sql.MAX), (product.ProductContent || null))
                    .input("ProjectId", sql.Int, (product.ProjectId || 0))
                    .input("CustomerId", sql.Int, product.CustomerId)
                    .input("Breadcrumb", sql.NVarChar(250), (product.Breadcrumb || null)) 
                    .input("Address", sql.NVarChar(500), (product.Address || null)) 
                    .input("Verified", sql.TinyInt, (product.Verified || null))
                    .input("IsVideo", sql.TinyInt, (product.IsVideo || null))
                    .input("Area", sql.Float, (product.Area || null))
                    .input("AreaDisplay", sql.NVarChar(50), (product.AreaDisplay || null)) 
                    .input("Price", sql.Float, (product.Price || null))
                    .input("PriceDisplay", sql.NVarChar(50), (product.PriceDisplay || null))  
                    .input("ComputedPrice", sql.Float, (product.ComputedPrice || null))
                    .input("Facade", sql.Float, (product.Facade || null))
                    .input("FacadeDisplay", sql.NVarChar(50), (product.FacadeDisplay || null)) 
                    .input("WayIn", sql.Float, (product.WayIn || null))
                    .input("WayInDisplay", sql.NVarChar(50), (product.WayInDisplay || null)) 
                    .input("Floors", sql.TinyInt, (product.Floors || null))
                    .input("HouseDirection", sql.NVarChar(50), (product.HouseDirection || null))  
                    .input("BalconyDirection", sql.NVarChar(50), (product.BalconyDirection || null))  
                    .input("Rooms", sql.TinyInt, (product.Rooms || null))
                    .input("Toilets", sql.SmallInt, (product.Toilets || null))
                    .input("Juridical", sql.NVarChar(250), (product.Juridical || null))
                    .input("Interiors", sql.NVarChar(250), (product.Interiors || null))
                    .input("ProductTypeId", sql.Int, (product.ProductTypeId || null))
                    .input("ActionTypeId", sql.Int, (product.ActionTypeId || null))
                    .input("LandTypeId", sql.Int, (product.LandTypeId || null))
                    .input("Latitude", sql.Float, (product.Latitude || null))
                    .input("Longitude", sql.Float, (product.Longitude || null))
                    .input("PublishedAt", sql.DateTime, (product.PublishedAt || null))
                    .input("ExpirationAt", sql.DateTime, (product.ExpirationAt || null))
                    .output('ProductId', sql.Int)
                    .execute('Products_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['ProductId'];
            } 
        }
    } 
    catch (error) 
    {
        console.error(`productInsert error => ${error}\n`);
    }

    return resultVar;
}

async function scrapeLogInsert(scrapeLog)
{
    let resultVar = 0;
    try 
    {
        console.log(`Xử lý log dữ liệu => ${scrapeLog.Path}\n`);
        
        const pool = await getPool();

        if(pool != null)
        {
            const [poolRequestError, recordsets] = 
                await handlePromise(pool.request()  
                    .input("ActBy", sql.NVarChar(150), scrapeLog.ActBy)  
                    .input("SiteId", sql.Int, scrapeLog.SiteId)  
                    .input("Path", sql.NVarChar(500), scrapeLog.Path)
                    .input("DetailPath", sql.NVarChar(500), (scrapeLog.DetailPath || null))
                    .input("Message", sql.NVarChar(sql.MAX), (scrapeLog.Message || null))
                    .output('ScrapeLogId', sql.Int)
                    .execute('ScrapeLogs_Insert'));

            if(poolRequestError)
            {
                console.log(`pool.request error => ${poolRequestError}\n`);
            }
            else
            {
                const output = recordsets.output || {};
                resultVar = output['ScrapeLogId'];
            }
        }
    } 
    catch (error) 
    {
        console.error(`scrapeLogInsert error => ${error}\n`);
    }

    return resultVar;
}

module.exports = {
    actionTypeInsert: actionTypeInsert,
    productTypeInsert: productTypeInsert,
    landTypeInsert: landTypeInsert,
    investorInsert: investorInsert,
    provinceInsert: provinceInsert,
    districtInsert: districtInsert,
    wardsInsert: wardsInsert,
    streetInsert: streetInsert,
    projectInsert: projectInsert,
    customerInsert: customerInsert,
    productInsert: productInsert,
    scrapeLogInsert: scrapeLogInsert
}