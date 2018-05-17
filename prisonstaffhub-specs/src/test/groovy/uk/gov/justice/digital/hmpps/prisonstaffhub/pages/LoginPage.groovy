package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.ErrorsModule

class LoginPage extends Page {

    static url = 'auth/login'

    static at = {
        title == 'Prison Staff Hub'
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
