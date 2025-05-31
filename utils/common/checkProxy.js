const { ProxyAgent } = require("undici");
require("dotenv").config();


// Paste your proxy list here
const proxies = process.env.PROXIES_URI.split(',');

// Function to check a single proxy
async function checkProxy(proxy) {
  const proxyUrl = `http://${proxy.ip}:${proxy.port}`;
  const agent = new ProxyAgent(proxyUrl);

  try {
    const response = await fetch('https://www.youtube.com', { dispatcher: agent, method: 'GET', timeout: 2000 });

    if (response.status === 200) {
      console.log(`✅ Proxy works: ${proxy.ip}:${proxy.port}`);
      return proxyUrl;
    }
  } catch (err) {
    console.log(`❌ Proxy failed: ${proxy.ip}:${proxy.port}`);
  }

  return null;
}

// Run check for all proxies
module.exports = async () => {
  const results = [];
  const mappedProxies = proxies.map(i => {
    const pData = i.split('_');
    return {
        ip: pData[0],
        port: pData[1],
    };
  });

  for (const proxy of mappedProxies) {
    const result = await checkProxy(proxy);
    result !== null && results.push(result);
  }

  return results;
};
