package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.ErrorsModule
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi

class LoginPage extends Page {

    static url = '/login'

    static at = {
        title == 'Prison Staff Hub'
        headingText == 'Sign in'
    }

    static content = {
        errors { module(ErrorsModule) }
        headingText { $('h1').text() }
        signInButton{ $("button", type: 'submit') }
    }

    void loginAs(UserAccount userAccount, String password) {

        $('form').username = userAccount.username
        $('form').password = password

        assert signInButton.text() == 'Sign in'

        signInButton.click()
    }
}
