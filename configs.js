require('dotenv').config();

module.exports =
{
    actionBy: process.env.ACTION_BY,
    siteId: process.env.SITE_ID,
    websiteDomain: process.env.WEBSITE_DOMAIN,
    randomMin: parseInt(process.env.RANDOM_MIN),
    randomMax: parseInt(process.env.RANDOM_MAX),
    poolMin: parseInt(process.env.POOL_MIN),
    poolMax: parseInt(process.env.POOL_MAX),
    poolIdleTimeout: parseInt(process.env.POOL_IDLE_TIMEOUT),
    decryptPhoneUrl: process.env.DECRYPT_PHONE_URL,
    executablePath: process.env.EXECUTABLE_PATH,

    databaseUser: process.env.DATABASE_USER,
    databasePassword: process.env.DATABASE_PASSWORD,
    databaseServer: process.env.DATABASE_HOST,
    databaseName: process.env.DATABASE_NAME

}