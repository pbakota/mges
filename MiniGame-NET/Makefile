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

APP=MiniGame

all: build

build:
	dotnet build $(APP).sln

run:
	dotnet run -c Debug --project $(APP)/$(APP).csproj

clean:
	dotnet clean

publish:
	dotnet publish /m:1 -f "net6.0" -c Release MiniGame -r linux-x64 --output output/linux-x64 --self-contained
	tar zcf MiniGame.tgz -C output/linux-x64 .
	dotnet publish /m:1 -f "net6.0" -c Release MiniGame -r win-x64 --output output/win-x64 --self-contained
	tar zcf MiniGame.tgz -C output/win-x64 .

sonarqube:
	dotnet sonarscanner begin /k:"MiniGame-NET" /d:sonar.host.url="http://playbox:9000"  /d:sonar.login="sqp_6c5297a73fa2e518ce87c64163a3572ca858db38" /d:sonar.exclusions="SDL2-CS/**" && \
	make && \
	dotnet sonarscanner end /d:sonar.login="sqp_6c5297a73fa2e518ce87c64163a3572ca858db38"

