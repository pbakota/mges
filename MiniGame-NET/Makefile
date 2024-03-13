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

