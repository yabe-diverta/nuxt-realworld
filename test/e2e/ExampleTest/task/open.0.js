module.exports = async ({ browser, page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' })
    await page.waitTillHTMLRendered()
}
