package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import geb.spock.GebReportingSpec
import org.junit.Rule
import org.openqa.selenium.logging.LogType
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.TokenVerificationApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses.AdjudicationResponses

class BrowserReportingSpec extends GebReportingSpec {
  @Rule
  TokenVerificationApi tokenVerificationApi = new TokenVerificationApi()

  def setup() {
    tokenVerificationApi.stubVerifyToken(true)
  }

  void cleanup() {
    try {
      driver.executeScript("console.log('Test finished')")
      def logEntries = driver.manage().logs().get(LogType.BROWSER).all
      println "START WebDriver $LogType.BROWSER logs"
      logEntries.each {
        println(it)
      }
      println "END WebDriver $LogType.BROWSER logs"
    } catch (error) {
      error.printStackTrace()
    }
  }
}
