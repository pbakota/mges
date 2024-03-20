# Copyright 2023 Peter Bakota
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

all: build
.PHNONY: build run

build:
	go build

run:
	go run main.go

fmt:
	go fmt *.go

sonarqube:
	sonar-scanner \
		-Dsonar.projectKey=Minigame-GO \
		-Dsonar.sources=. \
		-Dsonar.host.url=http://playbox:9000 \
		-Dsonar.login=sqp_ef0694bb2b86ccde719511fb734c15efa8787a89
