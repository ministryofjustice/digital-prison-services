package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import groovyx.net.http.HttpBuilder
import groovyx.net.http.HttpException
import org.junit.Rule
import spock.lang.Specification
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.CommunityApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi

import static groovyx.net.http.HttpBuilder.configure

class PingSpecification extends Specification {

    HttpBuilder http

    def setup() {
        http = configure {
            request.uri = 'http://localhost:3006/ping'
        }
    }

    def "Ping page returns pong"() {
        given:

        when:
        def response = this.http.get()
        then:
        new String(response) == 'pong'
    }
}
