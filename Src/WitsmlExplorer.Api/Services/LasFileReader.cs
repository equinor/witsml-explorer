using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;

namespace WitsmlExplorer.Api.Services
{
    public class LasCurve
    {
        public string Mnemonic { get; init; }
        public string Unit { get; init; }
    }

    /// <summary>
    /// Forward-only LAS 2.0 reader that keeps only one data row in memory at a time,
    /// so that files of several gigabytes can be imported.
    /// </summary>
    public sealed class LasFileReader : IDisposable
    {
        private readonly StreamReader _reader;
        private readonly CountingStream _countingStream;
        private string _pendingLine;

        public LasFileReader(Stream stream)
        {
            _countingStream = new CountingStream(stream);
            _reader = new StreamReader(_countingStream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, bufferSize: 1024 * 1024);
        }

        public IList<LasCurve> Curves { get; } = new List<LasCurve>();
        public string NullValue { get; private set; }
        public bool Wrapped { get; private set; }

        /// <summary>Number of bytes consumed from the underlying stream (approximate due to buffering).</summary>
        public long BytesRead => _countingStream.BytesRead;

        /// <summary>
        /// Reads all sections up to and including the ~A line. Must be called before <see cref="ReadRows"/>.
        /// </summary>
        public void ReadHeader()
        {
            string section = null;
            string line;
            while ((line = _reader.ReadLine()) != null)
            {
                string trimmed = line.Trim();
                if (trimmed.Length == 0 || trimmed.StartsWith('#'))
                {
                    continue;
                }
                if (trimmed.StartsWith('~'))
                {
                    section = trimmed.Length > 1 ? char.ToUpperInvariant(trimmed[1]).ToString() : string.Empty;
                    if (section == "A")
                    {
                        if (Curves.Count == 0)
                        {
                            throw new InvalidDataException("The LAS file does not contain a ~C (curve information) section before ~A.");
                        }
                        return;
                    }
                    continue;
                }

                switch (section)
                {
                    case "V":
                        ParseVersionLine(trimmed);
                        break;
                    case "W":
                        ParseWellLine(trimmed);
                        break;
                    case "C":
                        Curves.Add(ParseCurveLine(trimmed));
                        break;
                }
            }
            throw new InvalidDataException("The LAS file does not contain a ~A (ASCII data) section.");
        }

        /// <summary>
        /// Yields one row per index value. Values equal to the NULL value are returned as empty strings.
        /// </summary>
        public IEnumerable<string[]> ReadRows()
        {
            int curveCount = Curves.Count;
            List<string> buffer = new(curveCount);
            string line;
            while ((line = _pendingLine ?? _reader.ReadLine()) != null)
            {
                _pendingLine = null;
                string trimmed = line.Trim();
                if (trimmed.Length == 0 || trimmed.StartsWith('#'))
                {
                    continue;
                }
                if (trimmed.StartsWith('~'))
                {
                    yield break;
                }

                foreach (string token in Tokenize(trimmed))
                {
                    buffer.Add(IsNull(token) ? string.Empty : token);
                    if (Wrapped && buffer.Count == curveCount)
                    {
                        yield return buffer.ToArray();
                        buffer.Clear();
                    }
                }

                if (!Wrapped)
                {
                    if (buffer.Count != curveCount)
                    {
                        throw new InvalidDataException($"Data row has {buffer.Count} values, expected {curveCount}: '{Truncate(trimmed)}'.");
                    }
                    yield return buffer.ToArray();
                    buffer.Clear();
                }
            }

            if (buffer.Count > 0)
            {
                throw new InvalidDataException($"Incomplete data row at end of file: got {buffer.Count} values, expected {curveCount}.");
            }
        }

        public void Dispose()
        {
            _reader.Dispose();
        }

        private bool IsNull(string token)
        {
            if (NullValue == null)
            {
                return false;
            }
            if (token == NullValue)
            {
                return true;
            }
            return double.TryParse(token, NumberStyles.Float, CultureInfo.InvariantCulture, out double value)
                && double.TryParse(NullValue, NumberStyles.Float, CultureInfo.InvariantCulture, out double nullValue)
                && value == nullValue;
        }

        private void ParseVersionLine(string line)
        {
            (string mnemonic, _, string value) = SplitHeaderLine(line);
            if (mnemonic.Equals("WRAP", StringComparison.OrdinalIgnoreCase))
            {
                Wrapped = value.Equals("YES", StringComparison.OrdinalIgnoreCase);
            }
        }

        private void ParseWellLine(string line)
        {
            (string mnemonic, _, string value) = SplitHeaderLine(line);
            if (mnemonic.Equals("NULL", StringComparison.OrdinalIgnoreCase) && value.Length > 0)
            {
                NullValue = value;
            }
        }

        private static LasCurve ParseCurveLine(string line)
        {
            (string mnemonic, string unit, _) = SplitHeaderLine(line);
            return new LasCurve
            {
                Mnemonic = mnemonic.Replace(' ', '_'),
                Unit = unit
            };
        }

        /// <summary>
        /// Splits a header line in the form "MNEM .UNIT VALUE : DESCRIPTION".
        /// </summary>
        internal static (string Mnemonic, string Unit, string Value) SplitHeaderLine(string line)
        {
            int dotIndex = line.IndexOf('.');
            if (dotIndex < 0)
            {
                return (line.Trim(), string.Empty, string.Empty);
            }
            string mnemonic = line[..dotIndex].Trim();
            int colonIndex = line.LastIndexOf(':');
            string rest = colonIndex > dotIndex ? line[(dotIndex + 1)..colonIndex] : line[(dotIndex + 1)..];
            int unitEnd = 0;
            while (unitEnd < rest.Length && !char.IsWhiteSpace(rest[unitEnd]))
            {
                unitEnd++;
            }
            string unit = rest[..unitEnd];
            string value = rest[unitEnd..].Trim();
            return (mnemonic, unit, value);
        }

        internal static IEnumerable<string> Tokenize(string line)
        {
            int i = 0;
            while (i < line.Length)
            {
                while (i < line.Length && (char.IsWhiteSpace(line[i]) || line[i] == ','))
                {
                    i++;
                }
                if (i >= line.Length)
                {
                    yield break;
                }
                if (line[i] == '"')
                {
                    int end = line.IndexOf('"', i + 1);
                    if (end < 0)
                    {
                        end = line.Length;
                    }
                    yield return line[(i + 1)..end];
                    i = end + 1;
                }
                else
                {
                    int start = i;
                    while (i < line.Length && !char.IsWhiteSpace(line[i]) && line[i] != ',')
                    {
                        i++;
                    }
                    yield return line[start..i];
                }
            }
        }

        private static string Truncate(string value) => value.Length > 100 ? value[..100] + "..." : value;

        private sealed class CountingStream : Stream
        {
            private readonly Stream _inner;

            public CountingStream(Stream inner)
            {
                _inner = inner;
            }

            public long BytesRead { get; private set; }
            public override bool CanRead => true;
            public override bool CanSeek => false;
            public override bool CanWrite => false;
            public override long Length => _inner.Length;
            public override long Position { get => BytesRead; set => throw new NotSupportedException(); }

            public override int Read(byte[] buffer, int offset, int count)
            {
                int read = _inner.Read(buffer, offset, count);
                BytesRead += read;
                return read;
            }

            public override void Flush() { }
            public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
            public override void SetLength(long value) => throw new NotSupportedException();
            public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

            protected override void Dispose(bool disposing)
            {
                if (disposing)
                {
                    _inner.Dispose();
                }
                base.Dispose(disposing);
            }
        }
    }
}
