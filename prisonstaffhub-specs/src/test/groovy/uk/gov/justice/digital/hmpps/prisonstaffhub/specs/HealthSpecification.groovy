package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import groovyx.net.http.HttpBuilder
import groovyx.net.http.HttpException
import org.junit.Rule
import spock.lang.Specification
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.OauthApi
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.WhereaboutsApi

import static groovyx.net.http.HttpBuilder.configure

class HealthSpecification extends Specification {

    @Rule
    WhereaboutsApi whereaboutsApi = new WhereaboutsApi()

    @Rule
    Elite2Api elite2Api = new Elite2Api()

    @Rule
    OauthApi oauthApi = new OauthApi()

    HttpBuilder http

    def setup() {
        http = configure {
            request.uri = 'http://localhost:3006/health'
        }
    }

    def "Health page reports ok"() {

        given:
        whereaboutsApi.stubHealth()
        elite2Api.stubHealth()
        oauthApi.stubHealth()

        when:
        def response = this.http.get()
        then:
        response.uptime > 0.0
        response.name == "prisonstaffhub"
        !response.version.isEmpty()
        response.api == [auth:'UP', elite2:'UP', whereabouts:'UP']
    }

    def "Health page reports API down"() {

        given:
        whereaboutsApi.stubHealth()
        elite2Api.stubDelayedError('/ping', 500)
        oauthApi.stubHealth()

        when:
        def response
        try {
            response = http.get()
        } catch (HttpException e) {
            response = e.body
        }

        then:
        response.name == "prisonstaffhub"
        !response.version.isEmpty()
        response.api == [auth:'UP', elite2:[timeout:1000, code:'ECONNABORTED', errno:'ETIMEDOUT', retries:2], whereabouts:'UP']
    }
}
