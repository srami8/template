// Dokončení instalace doplňku: údaje o e-shopu a výchozí kód do šablony.
// Běží až po odpovědi Shoptetu na /install (ten čeká max. 5 s).

import { getInstallation, saveInstallation } from './store.mjs';
import { getEshopInfo, setHeaderSnippet } from './shoptet.mjs';
import { DEFAULT_THEME_CONFIG, buildHeaderSnippet } from './theme-config.mjs';

// Údaje o e-shopu potřebují právo „Informace o e-shopu“. Bez něj použijeme výchozí hodnoty.
async function eshopDetails(installation) {
  const eshopUrl = installation.eshopUrl.replace(/\/$/, '');
  const fallback = { eshopName: eshopUrl, oauthBase: `${eshopUrl}/action/OAuthServer/` };
  try {
    const { data } = await getEshopInfo(installation);
    return {
      eshopName: data.contactInformation?.eshopName || data.name || fallback.eshopName,
      oauthBase: data.urls?.find((u) => u.ident === 'oauth')?.url || fallback.oauthBase,
    };
  } catch (error) {
    console.warn(`instalace: údaje o e-shopu nejsou dostupné (${error.message}), použiji výchozí`);
    return fallback;
  }
}

export async function finishInstall(eshopId) {
  const installation = getInstallation(eshopId);
  const updated = saveInstallation(eshopId, {
    ...(await eshopDetails(installation)),
    themeConfig: installation.themeConfig || DEFAULT_THEME_CONFIG,
  });
  await setHeaderSnippet(updated, buildHeaderSnippet(updated.themeConfig));
  console.log(`instalace: e-shop ${eshopId} má výchozí nastavení šablony`);
}
