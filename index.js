addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

const BUCKET_NAME = '61st-regiment';
const BUCKET_URL = `http://storage.googleapis.com/${BUCKET_NAME}`

async function serveAsset(event){
  const url = new URL(event.request.url)
  const cache = caches.default
  let response = await cache.match(event.request)
  if(!response){
    response = await fetch(`${BUCKET_URL}${url.pathname}`)
    const headers = { "cache-constrol" : "public, max-age=14400"}
    response = new Response(response.body, {...response, headers})
    event.waitUntil(cache.put(event.request, response.clone()))
  }
  return response
}

/**
 * Respond with hello worker text
 * @param {Request} event
 */
async function handleRequest(event) {
  if (event.request.method === "GET") {
    let respone = await serveAsset(event)
    if (respone.status > 399) {
      respone = new Response(respone.statusText, {status: respone.status})
    }
    return respone
  } else {
    return new Response("Method not allowed", {status:405})
  }
}
