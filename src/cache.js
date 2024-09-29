/**
 * MIT License
 * 
 * Copyright (c) 2023 Maksym Stoianov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



/**
 * `SuperCache` позволяет получить доступ к кешу для краткосрочного хранения данных.
 *
 * Текущая модификация дает возможность хранить больший объем данных на один ключ.
 * Это достигается за счет сжатия данных в `zip`, и дальнейшее дробление zip на части по `100 КБ`.
 *
 * __Внимание!__ Использование этого сервиса может увеличить время выполнения скрипта.
 *
 * ### Лимиты:
 * - Максимальная длина ключа: `250 символов`
 * - Максимальный объем данных (на ключ): `100 КБ`
 * - Максимальный объем данных: `100000 КБ (100 МБ)`
 * - Максимальное количество пар ключ/значение: `1000`
 *
 * ### Лимиты (после модификации):
 * - Максимальная длина ключа: `240 символов`
 * - Максимальный объем данных (на ключ): `99900 КБ (99,9 МБ)`
 * - Максимальный объем данных: `100000 КБ (100 МБ)`
 * - Максимальное количество пар ключ/значение: `1000`
 *
 * Для получения дополнительной информации см. [руководство по CacheService](https://developers.google.com/apps-script/reference/cache/cache-service).
 *
 * @class               SuperCache
 * @namespace           SuperCache
 * @version             1.0.1
 * @author              Maksym Stoianov <stoianov.maksym@gmail.com>
 * @license             MIT
 * @tutorial            https://maksymstoianov.com/
 * @see                 [GitHub](https://github.com/MaksymStoianov/SuperCache)
 */
class SuperCache {

  /**
   * Создает и возвращает экземпляр класса [`Cache`](#).
   * @return {Cache}
   */
  static newCache(...args) {
    return Reflect.construct(this.Cache, args);
  }



  /**
   * Получает экземпляр настроек, ограниченный текущим документом и сценарием.
   * 
   * #### Example
   * ```javascript
   * const cache = SuperCache.getDocumentCache();
   * cache.email = 'stoianov.maksym@gmail.com';
   * Logger.log(cache.email);
   * ```
   * @return {SuperCache.Cache} Экземпляр настроек документа или `null`.
   */
  static getDocumentCache() {
    return this.newCache('document');
  }



  /**
   * Получает экземпляр настроек, ограниченный сценарием.
   * 
   * #### Example
   * ```javascript
   * const cache = SuperCache.getScriptCache();
   * cache.email = 'stoianov.maksym@gmail.com';
   * Logger.log(cache.email);
   * ```
   * @return {SuperCache.Cache} Экземпляр настроек скрипта или `null`.
   */
  static getScriptCache() {
    return this.newCache('script');
  }



  /**
   * Получает экземпляр настроек, ограниченный текущим пользователем и сценарием.
   * 
   * #### Example
   * ```javascript
   * const cache = SuperCache.getUserCache();
   * cache.email = 'stoianov.maksym@gmail.com';
   * Logger.log(cache.email);
   * ```
   * @return {SuperCache.Cache} Экземпляр настроек пользователя или `null`.
   */
  static getUserCache() {
    return this.newCache('user');
  }



  /**
   * Проверяет, является ли заданное значение объектом типа [`Cache`](#).
   * @param {*} input Объект для проверки.
   * @return {boolean}
   */
  static isCache(input) {
    if (!arguments.length)
      throw new Error(`The parameters () don't match any method signature for ${this.name}.isCache.`);

    return (input instanceof this.Cache);
  }



  /**
   * @param {string} input Строка для проверки.
   * @return {boolean}
   */
  static isValidKey(input) {
    if (!arguments.length)
      throw new Error(`The parameters () don't match any method signature for ${this.name}.isValidKey.`);

    return (
      (
        typeof input === `string` &&
        (input => input > 0 && input <= 240)(input.length)
      ) ||
      /\.zip$/.test(input)
    );
  }



  /**
   * Получает хеш заданной строки.
   */
  /**
   * @overload
   * @param {string} value Входное значение, для которого создается хэш.
   * @return {string}
   */
  /**
   * @overload
   * @param {string} key Ключ, используемый для генерации хеша.
   * @param {string} value  Входное значение, для которого создается хэш.
   * @return {string}
   */
  /**
   * @overload
   * @param {string} value Входное значение, для которого создается хэш.
   * @param {string} charset 
   * @return {string}
   */
  /**
   * @overload
   * @param {string} key Ключ, используемый для генерации хеша.
   * @param {string} value Входное значение, для которого создается хэш.
   * @param {string} charset [Charset](https://developers.google.com/apps-script/reference/utilities/charset), представляющий входной набор символов.
   * @return {string}
   */
  static getHash(...args) {
    if (!arguments.length)
      throw new Error(`The parameters () don't match any method signature for ${this.name}.getHash.`);

    const _isValidKey = input => input.trim().length;
    const _isValidValue = input => input.trim().length;
    const _isValidCharset = input => [Utilities.Charset.UTF_8, Utilities.Charset.US_ASCII].includes(input);

    let bytes;

    if (args.length === 1) {
      const [value] = args;

      if (!_isValidValue(value))
        throw new TypeError(`The value parameter has an invalid value.`);

      bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, value);
    } else if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'object') {
      const [value, charset] = args;

      if (!_isValidValue(value))
        throw new TypeError(`The value parameter has an invalid value.`);

      if (!_isValidCharset(charset))
        throw new TypeError(`The charset parameter has an invalid value.`);

      bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, value, charset);

    } else if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
      const [key, value] = args;

      if (!_isValidKey(key))
        throw new TypeError(`The key parameter has an invalid value.`);

      if (!_isValidValue(value))
        throw new TypeError(`The value parameter has an invalid value.`);

      bytes = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_MD5, value, key);
    } else if (args.length === 3 && typeof args[0] === 'string' && typeof args[1] === 'string' && typeof args[2] === 'string') {
      const [key, value, charset] = args;

      if (!_isValidKey(key))
        throw new TypeError(`The key parameter has an invalid value.`);

      if (!_isValidValue(value))
        throw new TypeError(`The value parameter has an invalid value.`);

      if (!_isValidCharset(charset))
        throw new TypeError(`The charset parameter has an invalid value.`);

      bytes = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_MD5, value, key, charset);
    }

    else throw new Error(`Недопустимые аргументы: невозможно определить правильную перегрузку для ${this.name}.getHash.`);

    // Преобразование массива байтов в шестнадцатеричную строку.

    let result = '';

    for (let byte of bytes) {
      byte = (byte < 0 ? (byte += 256) : byte).toString(16);

      result += `${byte.length == 1 ? '0' : ''}${byte}`;
    }

    return result;
  }



  /**
   * Возвращает длину строки в кодировке UTF-8, измеряемую в байтах.
   * @param {string} input Строка, длина которой будет рассчитана в байтах.
   * @return {Integer} Длина входной строки в байтах.
   */
  static getByteSize(input) {
    if (!arguments.length)
      throw new Error(`The parameters () don't match any method signature for ${this.name}.getByteSize.`);

    if (typeof input !== 'string')
      throw new TypeError(`The input parameter has an invalid value.`);

    return input
      // .replace(/[\u{0000}-\u{007F}]/u, '0') // 0
      // .replace(/[\u{0080}-\u{07FF}]/u, '0') // 00
      // .replace(/[\u{0800}-\u{D7FF}\u{E000}-\u{FFFF}]/u, '0') // 000
      .replace(/[\u{D800}-\u{DFFF}]/u, '00') // 0000
      .length;
  }



  constructor() {
    throw new Error(`${this.constructor.name} is not a constructor.`);
  }

}





/**
 * Этот класс позволяет вставлять, извлекать и удалять элементы из кэша.
 * Для получения дополнительной информации см. [руководство по Class Cache](https://developers.google.com/apps-script/reference/cache/cache).
 * @class               Cache
 * @namespace           Cache
 * @version             1.0.0
 */
SuperCache.Cache = class Cache {

  /**
   * Возвращает объект `JavaScript`, содержащий все пары ключ/значение.
   * При этом, если необходимо, сжимает данные в `zip`, и разбивает его на части по `100 КБ`.
   * @param {string} key Ключ.
   * @param {string} value Значение.
   * @return {Object} Объект `JavaScript`, содержащий все пары ключ/значение.
   */
  static _getParts(key, value) {
    const result = {};
    const options = {};

    const MAX_BYTES = 100 * 1024;

    options.hash = SuperCache.getHash(value);
    options.size = SuperCache.getByteSize(value);

    if (options.size <= MAX_BYTES) {
      result[key] = value;
      return result;
    }

    // Если строка больше 100 КБ

    // Создаем архив
    let zip = Utilities
      .gzip(Utilities.newBlob(value, Utilities.Charset.UTF_8))
      .getBytes()
      .join(',');

    options.zip = {
      'hash': SuperCache.getHash(zip),
      'size': SuperCache.getByteSize(zip)
    };

    if (options.zip.size <= MAX_BYTES) {
      result[`${key}.zip`] = zip;
      return result;
    }

    // Если архив больше 100 КБ

    // Разбиваем на части

    let num_parts = 0;

    while (zip.length) {
      ++num_parts;

      if (num_parts >= 1000)
        throw new TypeError(`Слишком много частей.`);

      result[`${key}[${num_parts}].zip`] = zip.slice(0, MAX_BYTES);

      zip = zip.slice(MAX_BYTES);
    }

    options.num_parts = num_parts;
    options.hash = SuperCache.getHash(value);

    result[`${key}[0].zip`] = JSON.stringify(options);

    return result;
  }



  /**
   * @param {string} [service = 'script'] Может быть: `script`, `document` или `user`.
   */
  constructor(service) {

    /**
     * @private
     * @type {string}
     */
    this._service = null;


    /**
     * @private
     * @type {SuperCache.Cache}
     */
    this._cache = null;


    /**
     * @private
     * @type {Object}
     */
    this._values = {};


    /**
     * @private
     * @type {Proxy}
     */
    this._proxy = new Proxy(this, {

      /**
       * @param {Object} target 
       * @param {string} prop 
       * @param {Object} receiver
       * @return {*}
       */
      get(target, prop, receiver) {
        if (prop === 'inspect') {
          return null;
        }

        if (prop == '_proxy') {
          return receiver;
        }

        if (typeof prop === 'symbol' || ['_service', '_cache', '_values'].includes(prop)) {
          return target[prop];
        }

        if (typeof target[prop] === 'function') {
          return (...args) => target[prop](...args);
        }

        return target.get(prop);
      },



      /**
       * @param {Object} target 
       * @param {string} prop 
       * @param {*} value 
       * @param {Object} receiver
       * @return {*}
       */
      set(target, prop, value) {
        if (['_service', '_cache', '_values', '_proxy'].includes(prop)) {
          return void 0;
        }

        return target.put(prop, value);
      },



      /**
       * @param {Object} target 
       * @param {string} prop 
       * @return {*}
       */
      deleteProperty(target, prop) {
        return target.remove(prop);
      }

    });


    for (const key of Object.getOwnPropertyNames(this)) {
      if (key.startsWith('_')) {
        // Скрыть свойство
        Object.defineProperty(this, key, {
          "configurable": true,
          "enumerable": false,
          "writable": true
        });
      }
    }

    if (service) {
      this.setService(service);
    }

    return this._proxy;
  }



  /**
   * Устанавливает сервис.
   * @param {string} [input = 'script'] Может быть: `script`, `document` или `user`.
   */
  setService(input = 'script') {
    if (!arguments.length) {
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.setService.`);
    }

    if (typeof input !== 'string') {
      throw new TypeError(`Параметры (${typeof input}) не соответствуют сигнатуре конструктора ${this.constructor.name}.setService.`);
    }

    if (!['document', 'script', 'user'].includes(input)) {
      throw new TypeError(`Параметр input содержит недопустимое значение.`);
    }

    this._service = input;

    // Инициализация сервисов
    switch (this._service) {
      case 'document':
        this._cache = CacheService.getDocumentCache();
        break;

      case 'user':
        this._cache = CacheService.getUserCache();
        break;

      case 'script':
      default:
        this._cache = CacheService.getScriptCache();
        break;
    }
  }



  /**
   * Получает кэшированное значение для заданного ключа или `null`, если ничего не найдено.
   * @param {string} key Ключ для поиска в кеше.
   * @return {string} Кэшированное значение или `null`, если ничего не найдено.
   */
  get(key) {
    if (!arguments.length)
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.get.`);

    if (!SuperCache.isValidKey(key)) {
      throw new TypeError(`Параметры (${typeof key}) не соответствуют сигнатуре метода ${this.constructor.name}.get.`);
    }

    return (this.getAll([key])[key] ?? null);
  }



  /**
   * Возвращает объект `JavaScript`, содержащий все пары ключ/значение, найденные в кеше для массива ключей.
   *
   * Для получения дополнительной информации см. [документацию по Cache.getAll()](https://developers.google.com/apps-script/reference/cache/cache#getallkeys).
   *
   * @param {String[]} keys Ключи для поиска.
   * @return {Object} Объект `JavaScript`, содержащий пары ключ/значение для всех ключей, найденных в кеше.
   */
  getAll(keys) {
    if (!arguments.length)
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.getAll.`);

    if (!Array.isArray(keys))
      throw new TypeError(`Параметры (${typeof keys}) не соответствуют сигнатуре метода ${this.constructor.name}.getAll.`);

    for (const key of keys) {
      if (!SuperCache.isValidKey(key)) {
        throw new TypeError(`Ключ "${key}" не соответствует сигнатуре метода.`);
      }
    }

    const result = {};

    try {
      keys = keys
        .map(key => [key, `${key}.zip`, `${key}[0].zip`])
        .flat(Infinity);

      let values = this._cache
        .getAll(keys);

      const zips = {};

      for (let key in values) {
        try {
          let value = values[key];

          if (/\.zip$/.test(key)) {
            let [, _key, _hasParts] = key
              .match(/^(.+?)(\[\d+\])?\.zip$/) || [];

            if (_hasParts === `[0]`) {
              // Has parts
              value = JSON
                .parse(value);

              value.parts = new Array(value.num_parts)
                .fill(_key)
                .map((key, i) => `${key}[${++i}].zip`);
            }

            zips[_key] = value;
          }

          else (result[key] = value);
        } catch (error) {
          this.remove(key);
        }
      }

      if (!Object.keys(zips).length)
        return result;

      // Получить части

      keys = Object
        .keys(zips)
        .filter(key => typeof zips[key] === `object`)
        .map(key => zips[key].parts)
        .flat(Infinity);

      values = this._cache
        .getAll(keys);

      for (const key in zips) {
        try {
          let [options, value] = (input => typeof input === `object` ? [input, null] : [{}, input])(zips[key]);

          if (!value) {
            value = options.parts
              .map(key => {
                if (!values[key])
                  throw new TypeError(`!value: ${key}`);

                return values[key];
              })
              .join('');

            if (typeof options.zip === 'object') {
              // Проверить хеш архива (целостность данных)
              if (options.zip?.hash && options.zip?.hash !== SuperCache.getHash(value)) {
                throw new Error(`!zip.hash`);
              }
            }
          }

          let zip = JSON.parse(`[${value}]`);

          zip = Utilities.newBlob(zip, 'application/x-gzip')

          value = Utilities
            .ungzip(zip)
            .getDataAsString();

          // Проверить хеш (целостность данных)
          if (options.hash && options.hash !== SuperCache.getHash(value))
            throw new TypeError(`!hash`);

          result[key] = value;
        } catch (error) {
          this.remove(key);
        }
      }

      return result;
    } catch (error) {
      return {};
    }
  }



  /**
   * Добавляет в кеш пару ключ/значение со сроком действия (в секундах).
   *
   * Для получения дополнительной информации см. [документацию по Cache.put()](https://developers.google.com/apps-script/reference/cache/cache#putkey,-value,-expirationinseconds).
   *
   * @param {string} key Ключ для хранения значения в кеше.
   * @param {string} value Значение для записи в кеше.
   * @param {Integer} [expirationInSeconds=600] Максимальное время, в течение которого значение остается в кэше, в секундах.
   * Минимум 1 секунда, максимум 21600 секунд (6 часов).
   * По умолчанию: 600 секунд (10 минут).
   * @return {Void}
   */
  put(key, value, expirationInSeconds = 600) {
    if (!arguments.length)
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.put.`);

    if (!SuperCache.isValidKey(key))
      throw new TypeError(`Параметры (${typeof key}) не соответствуют сигнатуре метода ${this.constructor.name}.put.`);

    if (typeof value !== `string`)
      throw new TypeError(`Параметры (${typeof key}, ${typeof value}) не соответствуют сигнатуре метода ${this.constructor.name}.put.`);

    if (!(input => Number.isInteger(input) && input > 0 && input <= 21600)(expirationInSeconds))
      throw new TypeError(`Параметры (${typeof key}, ${typeof value}, ${typeof expirationInSeconds}) не соответствуют сигнатуре метода ${this.constructor.name}.put.`);

    return this.putAll({
      [key]: value
    });
  }



  /**
   * Добавляет в кеш набор пар ключ/значение со сроком действия (в секундах).
   *
   * Для получения дополнительной информации см. [документацию по Cache.putAll()](https://developers.google.com/apps-script/reference/cache/cache#putallvalues,-expirationinseconds).
   *
   * @param {Object} values Объект `JavaScript`, содержащий строковые ключи и значения.
   * @param {Integer} [expirationInSeconds=600] Максимальное время, в течение которого значение остается в кэше, в секундах.
   * Минимум 1 секунда, максимум 21600 секунд (6 часов).
   * По умолчанию: 600 секунд (10 минут).
   * @return {Void}
   */
  putAll(values, expirationInSeconds = 600) {
    if (!arguments.length)
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.putAll.`);

    if (Object.prototype.toString.call(values) !== `[object Object]`)
      throw new TypeError(`Параметры (${typeof values}) не соответствуют сигнатуре метода ${this.constructor.name}.putAll.`);

    if (!(input => Number.isInteger(input) && input > 0 && input <= 21600)(expirationInSeconds))
      throw new TypeError(`Параметры (${typeof values}, ${typeof expirationInSeconds}) не соответствуют сигнатуре метода ${this.constructor.name}.putAll.`);

    values = {};

    for (const key in arguments[0]) {
      let value = arguments[0][key];

      if (!SuperCache.isValidKey(key))
        throw new TypeError(`Ключ "${typeof key}" не соответствует сигнатуре метода.`);

      if (typeof value !== `string`)
        throw new TypeError(`Значение ключа "${typeof key}" не соответствует сигнатуре метода.`);

      values = Object.assign(values, this.constructor._getParts(key, value));
    }

    this.removeAll(Object.keys(arguments[0]));

    return this._cache.putAll(values, expirationInSeconds);
  }



  /**
   * Удаляет запись из кеша, используя заданный ключ.
   *
   * Для получения дополнительной информации см. [документацию по Cache.remove()](https://developers.google.com/apps-script/reference/cache/cache#removekey).
   *
   * @param {string} key Ключ для удаления записи из кеша.
   * @return {Void}
   */
  remove(key) {
    if (!arguments.length)
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.remove.`);

    if (!SuperCache.isValidKey(key))
      throw new TypeError(`Параметры (${typeof key}) не соответствуют сигнатуре метода ${this.constructor.name}.remove.`);

    return this.removeAll([key]);
  }



  /**
   * Удаляет набор записей из кэша.
   *
   * Для получения дополнительной информации см. [документацию по Cache.removeAll()](https://developers.google.com/apps-script/reference/cache/cache#removeallkeys).
   *
   * @param {String[]} keys Массив ключей для удаления из кеша.
   * @return {Void}
   */
  removeAll(keys) {
    if (!arguments.length)
      throw new Error(`Параметры () не соответствуют сигнатуре метода ${this.constructor.name}.removeAll.`);

    if (!Array.isArray(keys))
      throw new TypeError(`Параметры (${typeof keys}) не соответствуют сигнатуре метода ${this.constructor.name}.removeAll.`);

    for (const key of keys) {
      if (!SuperCache.isValidKey(key))
        throw new TypeError(`Ключ "${typeof key}" не соответствует сигнатуре метода.`);
    }

    let values = this._cache.getAll(keys.map(key => `${key}[0].zip`));

    keys = keys.map(key => `${key}.zip`);

    for (const key in values) {
      try {
        let value = values[key];

        if (!value) continue;

        let options = JSON.parse(value);

        new Array(options.num_parts + 1)
          .fill(key)
          .map((key, i) => keys.push(`${key}[${i}].zip`));
      } catch (error) { }
    }

    return this._cache.removeAll(keys);
  }



  /**
   * Метод `valueOf()` возвращает примитивное значение указанного объекта.
   *
   * @return {string}
   */
  valueOf() {
    return this.constructor.name;
  }



  /**
   * Вызывается при преобразовании объекта в соответствующее примитивное значение.
   * @param {string} hint Строковый аргумент, который передаёт желаемый тип примитива. Может быть: `number`, `string`, и `default`.
   * @return {string}
   */
  [Symbol.toPrimitive](hint) {
    return this.constructor.name;
  }



  /**
   * Метод `toString()` возвращает строку, представляющую объект.
   *
   * @return {string}
   */
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

};
