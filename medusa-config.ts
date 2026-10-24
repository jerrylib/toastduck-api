import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
    databaseUrl: process.env.DATABASE_URL,
    // databaseDriverOptions: {
    //   ssl: false,
    //   sslmode: "disable",
    // },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    vite: () => {
      return {
        server: {
          allowedHosts: [".toastduck.com", '.medusa', ".toastduck.online"], // Replace with your actual host, include the leading dot
        },
      }
    }
  },
  plugins: [
    {
      resolve: "@alphabite/medusa-paypal",
      options: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        isSandbox: process.env.PAYPAL_IS_SANDBOX === "true",
        webhookId: process.env.PAYPAL_WEBHOOK_ID,
        includeShippingData: false,
        includeCustomerData: false,
      },
    },
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              endpoint: process.env.S3_API_ENDPOINT,
              bucket: "toastduck-s3",
              region: "auto",
              access_key_id: process.env.R2_ACCESS_KEY,
              secret_access_key: process.env.R2_SECRET_KEY,
              s3ForcePathStyle: true
            }
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/ttpayment",
            id: "tt",
            options: {
              // TODO: 替换T/T收款信息
              bank_name: "China Construction Bank",
              account_name: "Fujian Toast Duck International Business Co., Ltd.",
              bank_account: "6xxx xxxx xxxx xxx",
            },
          },
          {
            resolve: "./src/modules/xTransferPayment",
            id: "xtransfer",
            options: {
              account_number: 63003681474,
              account_name: "Toastduck International Business Co., Limited",
              bank_name: "JPMorgan Chase Bank N.A., Hong Kong Branch",
              bank_code: '007',
              branch_code: 863,
              bank_address: "18/F, 20/F, 22-29/F, CHATER HOUSE, 8 CONNAUGHT ROAD CENTRAL, HONG KONG",
              country_region: "Hong Kong (China)",
              type_of_account: "Business Account",
              payment_message: "Please include [Buyer's Name, Invoice/Contract Number, and Product Name] in the memo or note section when making the payment.",
              swift_bic_code: "CHASHKHH（CHASHKHHXXX*If 11 characters are required）",
            },
          },
          {
            resolve: "@alphabite/medusa-paypal/providers/paypal",
            id: "paypal",
            options: {
              clientId: process.env.PAYPAL_CLIENT_ID,
              clientSecret: process.env.PAYPAL_CLIENT_SECRET,
              isSandbox: process.env.PAYPAL_IS_SANDBOX === "true",
              webhookId: process.env.PAYPAL_WEBHOOK_ID,
              includeShippingData: false,
              includeCustomerData: false,
            },
          },
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          },
          {
            resolve: "./src/modules/picture-payment",
            id: "wechat",
            options: {
              pic_url: 'https://images.toastduck.com/wechat.png',
            },
          },
          {
            resolve: "./src/modules/picture-payment",
            id: "alipay",
            options: {
              pic_url: 'https://images.toastduck.com/alipay2.jpg',
            },
          },
        ],
      },
    },
  ],

})
