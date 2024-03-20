all: build

build:
	mvn compile

clean:
	mvn clean

package:
	mvn clean compile package

run:
	mvn exec:exec

sonarqube:
	mvn clean verify sonar:sonar \
		-Dsonar.projectKey=MiniGame-Java \
		-Dsonar.host.url=http://playbox:9000 \
		-Dsonar.login=sqp_2e7e8858a782624884b9417a600119157ecebc80
