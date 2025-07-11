function doGet(e) {
  /**
   * Use this when permissions have been widened
   */
  // const email = Session.getEffectiveUser().getEmail();
  // const domain = "templestudiony.com";

  // if (!email || !email.endsWith("@" + domain)) {
  //   return ContentService.createTextOutput("Unauthorized")
  //     .setMimeType(ContentService.MimeType.TEXT)
  //     .setResponseCode(403);
  // }

  const landingPage = "home-directory";
  const html = HtmlService.createTemplateFromFile("base");

  try {
    const params = e.parameter;
    const effectiveUser = JSON.parse(getEffectiveUser());
    const htmlOb = {
      bodyFill: navigation(landingPage).html,
      pageSubtitle: pageSubtitleOb[landingPage],
      baseWebAppUrl,
      userName: effectiveUser.userName,
      orderNumber: getOrderNumber(),
    };

    for (let h in htmlOb) {
      html[h] = htmlOb[h];
    }

  } catch (error) { console.warn(error) };

  return html.evaluate();
}