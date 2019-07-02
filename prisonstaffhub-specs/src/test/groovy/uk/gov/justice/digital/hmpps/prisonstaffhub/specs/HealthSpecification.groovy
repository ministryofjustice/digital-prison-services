package uk.gov.justice.digital.hmpps.prisonstaffhub.specs

import groovyx.net.http.HttpBuilder
import groovyx.net.http.HttpException
import org.junit.Rule
import spock.lang.Specification
import uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.Elite2Api

import static groovyx.net.http.HttpBuilder.configure

class HealthSpecification extends Specification {


    @Rule
    Elite2Api elite2Api = new Elite2Api()

    HttpBuilder http

    def setup() {
        http = configure {
            request.uri = 'http://localhost:3006/health'
        }
    }

    def "Health page reports ok"() {

        given:
        elite2Api.stubHealth()

        when:
        def response = this.http.get()
        then:
        response.uptime > 0.0
        response.name == "prisonstaffhub"
        !response.version.isEmpty()
        response.api.elite2Api == 'ping'
    }

    def "Health page reports API down"() {

        given:
        elite2Api.stubDelayedError('/ping', 500)

        when:
        def response
        try {
            response = http.get()
        } catch (HttpException e) {
            response = e.body
        }

        then:
        response.api.elite2Api == "timeout of 2000ms exceeded"
    }
}
