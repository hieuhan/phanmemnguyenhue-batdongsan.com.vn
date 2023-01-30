const configs = require('./configs');

function handlePromise (promise)
{
    return promise.then(data => ([ undefined, data ]))
                  .catch(error => ([ error, undefined ]));
}

function getRandomNumber()
{
    let resultVar = 0;
    try 
    {
        resultVar = Math.floor(Math.random() * (configs.max - configs.min + 1)) + configs.min;
    } 
    catch (error) 
    {
        console.error(`getRandomNumber error => ${error.message}\n stack trace => ${error.stack}\n`);
    }
    
    return resultVar;
}

function urlRequestIsValid(urlRequest)
{
    let resultVar = false;
    try 
    {
        const regexUrlRequest = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

        if (!urlRequest.match(regexUrlRequest)) 
        {
            console.error(`Url => ${urlRequest} không hợp lệ\n`);
        }
        else
        {
            resultVar = true;
        }
    } 
    catch (error) 
    {
        console.error(`urlRequestIsValid('${urlRequest}') error => ${error.message}\n stack trace => ${error.stack}\n`);
    }

    return resultVar;
}

function getProductUrl(path)
{
    let resultVar = '';
    try 
    {
        if(path)
        {
            resultVar = path.trim();
            
            if(resultVar.length > 0)
            {
                if(resultVar.indexOf('://') <= 0)
                {   
                    while(resultVar.startsWith('/'))
                    {
                        resultVar = resultVar.substring(1);
                    }
    
                    resultVar = `${configs.websiteDomain}${resultVar}`;
                }
            }
        }
    } 
    catch (error) 
    {
        console.error(`getFullUrl('${path}') error => ${error.message}\n stack trace => ${error.stack}\n`);
    }

    return resultVar;
}

function urlRequestGetCurrentPage(urlRequest)
{
    let currentPage = 1;
    try 
    {
        currentPage = urlRequest.substring(urlRequest.lastIndexOf('/') + 1).replace('p','');
    } 
    catch (error) 
    {
        console.error(`urlRequestGetCurrentPage('${urlRequest}') error => ${error.message}\n stack trace => ${error.stack}\n`);
    }

    return currentPage;
}

module.exports = 
{
    handlePromise: handlePromise,
    getRandomNumber: getRandomNumber,
    urlRequestIsValid: urlRequestIsValid,
    getProductUrl: getProductUrl,
    urlRequestGetCurrentPage: urlRequestGetCurrentPage
};