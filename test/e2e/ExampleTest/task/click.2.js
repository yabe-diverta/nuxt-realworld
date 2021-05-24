module.exports = async ({ browser, page }) => {
    await page.waitForXPath("//a[contains(text(),'Sigin up')]")
    element = await page.$x("//a[contains(text(),'Sigin up')]")
    // force click even if the element is not visible.
    const click = element[0]
        .click()
        .catch(
            async (e) => await page.evaluate((elm) => elm.click(), element[0])
        )
    await Promise.all([click, page.waitTillHTMLRendered()])
}
