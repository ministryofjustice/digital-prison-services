package uk.gov.justice.digital.hmpps.keyworker.pages

import geb.Page
import uk.gov.justice.digital.hmpps.keyworker.model.UserAccount
import uk.gov.justice.digital.hmpps.keyworker.modules.ErrorsModule

class LoginPage extends Page {

    static url = 'auth/login'

    static at = {
        title == 'Key worker mgt'
        headingText == 'Login'
    }

    static content = {
        errors { module(ErrorsModule) }
        headingText { $('h1').text() }
        signInButton{ $("button", type: 'submit') }
    }

    void loginAs(UserAccount userAccount, String password) {

        $('form').username = userAccount.username
        $('form').password = password

//        def signInButton = $("button", type: 'submit')
        assert signInButton.text() == 'Sign in'

        signInButton.click()
    }

}
