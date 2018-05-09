import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.chrome.ChromeOptions

atCheckWaiting = true

waiting {
    timeout = 2
}

environments {
    chrome {
        driver = { new ChromeDriver() }
    }

    chromeHeadless {
        driver = {
            ChromeOptions options = new ChromeOptions()
            options.addArguments('headless')
            new ChromeDriver(options)
        }
    }
}

// Default if geb.env is not set to one of 'chrome', or 'chromeHeadless'
driver = {
    new ChromeDriver()
}

baseUrl = "http://localhost:3001/"

reportsDir = "build/geb-reports"
