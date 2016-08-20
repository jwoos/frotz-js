'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FileError = function (_Error) {
	_inherits(FileError, _Error);

	function FileError(message) {
		_classCallCheck(this, FileError);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FileError).call(this, message));

		_this.name = 'FileError';
		return _this;
	}

	return FileError;
}(Error);

var DFrotzInterfaceError = function (_Error2) {
	_inherits(DFrotzInterfaceError, _Error2);

	function DFrotzInterfaceError(message) {
		_classCallCheck(this, DFrotzInterfaceError);

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(DFrotzInterfaceError).call(this, message));

		_this2.name = 'DFrotzInterfaceError';
		return _this2;
	}

	return DFrotzInterfaceError;
}(Error);

module.exports = {
	FileError: FileError,
	DFrotzInterfaceError: DFrotzInterfaceError
};