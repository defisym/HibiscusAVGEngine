#define NOMINMAX

#include <iostream>

#include "CLI11.hpp"

#include "Encryption.h"
#include "WindowsCommon.h"

enum class Operation {
	Encrypt,
	Decrypt,
	Hash,
};

// -f "F:\DEV\HibisucsAVGEngine\Utilities\Encrypter_CLI\Debug\街道.png" - o "F:\DEV\HibisucsAVGEngine\Utilities\Encrypter_CLI\Debug\街道_E.png" - e - k 12345678ABCDEFGH
// -f "F:\DEV\HibisucsAVGEngine\Utilities\Encrypter_CLI\Debug\街道_E.png" - o "F:\DEV\HibisucsAVGEngine\Utilities\Encrypter_CLI\Debug\街道_E_D.png" - e - k 12345678ABCDEFGH
// -f "F:\DEV\HibisucsAVGEngine\Utilities\Encrypter_CLI\Debug\街道.png" --hash

int main(int argc, char** argv) {
	CLI::App app;

	app.allow_windows_style_options();

	std::string inFilePath = "";
	std::string outFilePath = "";
	std::string key = "";
	bool operationFlags[3] = { false };

	Operation operation = Operation::Encrypt;
	
	try {
		app.add_option("-f, --fileName", inFilePath)
			->required()
			->ignore_case();
		app.add_option("-o, --outFileName", outFilePath)
			->ignore_case();
		app.add_option("-k, --key", key)
			->ignore_case();

		app.add_flag("-e, --encrypt", operationFlags[0])
			->ignore_case();
		app.add_flag("-d, --decrypt", operationFlags[1])
			->ignore_case();
		// -h is used as help
		app.add_flag("--hash", operationFlags[2])
			->ignore_case();
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
		Encrypt.OpenFile(wFilePath.c_str());

		auto ret = encrypt
			? Encrypt.Encrypt()
			: Encrypt.Decrypt();

		if (!ret) {
			std::cout << "operation failed" << std::endl;

			exit(-1);
		}

		Encrypt.SaveFile(wOutFilePath.c_str());
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
			std::cout << "operation failed" << std::endl;

			exit(-1);
		}

		std::cout << ConvertWStrToStr(hash) << std::endl;

		break;
	}

	return 0;
}
