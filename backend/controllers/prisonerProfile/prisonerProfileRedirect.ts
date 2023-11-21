import config from '../../config'
import { isRedirectCaseLoad, isRedirectEnabled } from '../../utils'

export default ({ path, handler }) => {
  const prisonRollouts = {
    BLI: 1,
    EEI: 1,
    LYI: 1,
    PDI: 1,
    VEI: 1,
    BFI: 1,
    BRI: 1,
    LTI: 1,
    NWI: 1,
    WLI: 1,
    HVI: 1,
    KMI: 1,
    LFI: 1,
    PNI: 1,
    WMI: 1,
    CWI: 1,
    DAI: 1,
    EXI: 1,
    GMI: 1,
    LCI: 1,
    LII: 1,
    MHI: 1,
    NSI: 1,
    ONI: 1,
    WTI: 1,
    BCI: 1,
    HII: 1,
    LPI: 1,
    TCI: 1,
    BWI: 2,
    CFI: 2,
    PRI: 2,
    SWI: 2,
    UKI: 2,
    UPI: 2,
    MSI: 2,
    CLI: 2,
    EYI: 2,
    FDI: 2,
    LWI: 2,
    RCI: 2,
    EHI: 2,
    BXI: 2,
    HOI: 2,
    ISI: 2,
    PVI: 2,
    WWI: 2,
    WSI: 2,
    BAI: 2,
    FKI: 2,
    GHI: 2,
    GTI: 2,
    IWI: 2,
    LLI: 2,
    MRI: 2,
    SLI: 2,
    WRI: 2,
    WHI: 2,
    NMI: 3,
    RNI: 3,
    SKI: 3,
    SUI: 3,
    ACI: 3,
    ASI: 3,
    DGI: 3,
    FWI: 3,
    FBI: 3,
    FEI: 3,
    LGI: 3,
    NLI: 3,
    OWI: 3,
    PBI: 3,
    PFI: 3,
    RHI: 3,
    TSI: 3,
    AYI: 3,
    BNI: 3,
    GNI: 3,
    SPI: 3,
    HCI: 3,
    WCI: 3,
    DTI: 3,
    DMI: 3,
    HHI: 3,
    KVI: 3,
    CDI: 4,
    HPI: 4,
    HBI: 4,
    MTI: 4,
    WII: 4,
    BMI: 4,
    BSI: 4,
    FSI: 4,
    HEI: 4,
    SFI: 4,
    SHI: 4,
    SNI: 4,
    BZI: 4,
    DWI: 4,
    DHI: 4,
    ESI: 4,
    EWI: 4,
    FHI: 4,
    LNI: 4,
    SDI: 4,
    STI: 4,
    CKI: 4,
    FMI: 4,
    WNI: 4,
  }

  return async (req, res, next) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const redirectEnabled = isRedirectEnabled(res, activeCaseLoadId)
    const redirectCaseload = isRedirectCaseLoad(activeCaseLoadId)

    if (redirectEnabled && redirectCaseload) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    const caseloadBundle = prisonRollouts[activeCaseLoadId]
    const bundleRedirectDate = config.app.prisonerProfileRedirect.bundleDates[caseloadBundle - 1]

    if (config.app.prisonerProfileRedirect.url && bundleRedirectDate < Date.now()) {
      return res.redirect(`${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}${path}`)
    }

    return handler(req, res, next)
  }
}
