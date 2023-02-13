#define NOMINMAX

#include <format>
#include <iostream>

#include "CLI11.hpp"

#include "Encryption.h"
#include "WindowsCommon.h"

#include "..\Fini\SimpleIni.h"

int main(int argc, char** argv) {
	CLI::App app;

	app.allow_windows_style_options();

	std::string inFilePath = "";
	std::string outFilePath = "";
	
	std::string section = "";
	std::string item = "";

	std::string value = "";

	bool bUnicode = false;

	// -f "F:\DEV\Mobius\SteamWorks\_Content\MOBIUS BAND\settings\settings_Template.ini" --unicode --section System --item ExeHash --value updated
	
	try {
		app.add_option("-f, --fileName", inFilePath)
			->required()
			->ignore_case();
		app.add_option("-o, --outFileName", outFilePath)
			->ignore_case();

		app.add_option("-s, --section", section)
			->required()
			->ignore_case();
		app.add_option("-i, --item", item)
			->required()
			->ignore_case();

		app.add_option("-v, --value", value)
			->required()
			->ignore_case();

		app.add_flag("-u, --unicode", bUnicode)
			->required()
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

	typedef CSimpleIni INI;

	INI ini;

	if (bUnicode) {
		ini.SetUnicode();
	}

	auto wFilePath = ConvertStrToWStr(inFilePath);

	auto wOutFilePath = outFilePath == ""
		? wFilePath
		: ConvertStrToWStr(outFilePath);

	SI_Error err = SI_Error::SI_OK;

	err = ini.LoadFile(wFilePath.c_str());

	if (err != SI_Error::SI_OK) {
		std::cout << "failed to open file " << inFilePath << std::endl;

		return -1;
	}

	if (section == "" || item == "") {
		std::cout << "invalid section / key" << std::endl;

		return -1;
	}

	err = ini.SetValue(ConvertStrToWStr(section).c_str()
		, ConvertStrToWStr(item).c_str()
		, ConvertStrToWStr(value).c_str());

	if (err == SI_UPDATED || err == SI_INSERTED) {
		std::cout << "modified, save to file "<< outFilePath << std::endl;

		err = ini.SaveFile(wOutFilePath.c_str(), false);

		if (err != SI_Error::SI_OK) {
			std::cout << "save failed" << inFilePath << std::endl;

			return -1;
		}
	}

	return 0;
}
