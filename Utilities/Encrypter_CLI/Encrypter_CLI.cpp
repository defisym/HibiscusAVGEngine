#define NOMINMAX

#include <format>
#include <iostream>

#include "CLI11.hpp"

#include "Encryption.h"
#include "WindowsCommon.h"

enum class Operation {
	Encrypt,
	Decrypt,
	Hash,
};

// -f "F:\DEV\HibiscusAVGEngine\Utilities\Encrypter_CLI\Debug\街道.png" -o "F:\DEV\HibiscusAVGEngine\Utilities\Encrypter_CLI\Debug\街道_E.png" -e -k 12345678ABCDEFGH
// -f "F:\DEV\HibiscusAVGEngine\Utilities\Encrypter_CLI\Debug\街道_E.png" -o "F:\DEV\HibiscusAVGEngine\Utilities\Encrypter_CLI\Debug\街道_E_D.png" -d -k 12345678ABCDEFGH
// -f "F:\DEV\HibiscusAVGEngine\Utilities\Encrypter_CLI\Debug\街道.png" --hash

// -f "F:\DEV\Mobius\SteamWorks\_Content\MOBIUS BAND\data\dialogue\__Old\0104_第一章_日常•妹妹.asc" -e -k 12345678ABCDEFGH

int main(int argc, char** argv) {
	CLI::App app;

	app.allow_windows_style_options();

	std::string inFilePath = "";
	std::string outFilePath = "";
	std::string key = "";

	bool operationFlags[3] = { false };
	
	DWORD bufSz = BUFFER_SIZE;
	bool bTime = false;

	Operation operation = Operation::Encrypt;
	
	try {
		app.add_option("-f, --fileName", inFilePath)
			->required()
			->ignore_case();
		app.add_option("-o, --outFileName", outFilePath)
			->ignore_case();
		app.add_option("-k, --key", key)
			->ignore_case();
		app.add_option("--bufferSize", bufSz)
			->ignore_case();

		app.add_flag("-e, --encrypt", operationFlags[0])
			->ignore_case();
		app.add_flag("-d, --decrypt", operationFlags[1])
			->ignore_case();
		// -h is used as help
		app.add_flag("--hash", operationFlags[2])
			->ignore_case();
		//app.add_flag("--Time",bTime)
		//	->ignore_case();
	}
	catch (const CLI::ConstructionError& e) {
		std::cout << e.get_name() << std::endl;

		return -1;
	}

	//CLI11_PARSE(app, commandLine, true);	
	try {
		app.parse(argc, argv);
	}
	catch (const CLI::ParseError& e) {
		std::cout << e.get_name() << std::endl;

		return -1;
	}

	do {
		if (operationFlags[0]) {
			operation = Operation::Encrypt;

			break;
		}
		if (operationFlags[1]) {
			operation = Operation::Decrypt;

			break;
		}
		if (operationFlags[2]) {
			operation = Operation::Hash;

			break;
		}
	} while (0);

	Encryption Encrypt;

	auto enHandler = [&](bool encrypt) {
		if (key == "" || key.length() < 16) {
			std::cout << "invalid key" << std::endl;

			exit(-1);
		}

		auto wKey = ConvertStrToWStr(key);
		auto wFilePath = ConvertStrToWStr(inFilePath);

		auto wOutFilePath = outFilePath == ""
			? wFilePath
			: ConvertStrToWStr(outFilePath);

		Encrypt.GenerateKey(wKey.c_str());

//#define USE_PROCESS_DIRECTLY

#ifdef USE_PROCESS_DIRECTLY
		Encrypt.SetBufferSize(bufSz);
				
		auto ret =
			encrypt
			? Encrypt.EncryptFileDirectly(wFilePath.c_str())
			: Encrypt.DecryptFileDirectly(wFilePath.c_str());
#else
		auto ret =
			encrypt
			? Encrypt.EncryptFile(wFilePath.c_str())
			: Encrypt.DecryptFile(wFilePath.c_str());
#endif 

		if (!ret) {
			std::cout << std::format("{} operation failed, file {}\n"
				, encrypt
					? "encrypt"
					: "decrypt"
				, inFilePath);

			exit(-1);
		}

		Encrypt.SaveFile(wOutFilePath.c_str());
		std::cout << std::format("{} operation success, file {}\n"
			, encrypt
				? "encrypt"
				: "decrypt"
			, inFilePath);
	};

	switch (operation) {
	case Operation::Encrypt:
		enHandler(true);
		
		break;
	case Operation::Decrypt:
		enHandler(false);

		break;
	case Operation::Hash:
		Encrypt.OpenFile(ConvertStrToWStr(inFilePath).c_str());
		auto hash = Encrypt.GetHash();

		if (!hash) {
			std::cout << std::format("hash operation failed, file {}\n", inFilePath);

			exit(-1);
		}

		std::cout << ConvertWStrToStr(hash) << std::endl;

		break;
	}

	return 0;
}
