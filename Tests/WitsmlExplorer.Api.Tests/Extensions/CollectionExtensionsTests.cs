using System;
using System.Linq;
using WitsmlExplorer.Api.Extensions;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Extensions
{
    public class CollectionExtensionsTests
    {
        [Theory]
        [InlineData(1,10)]
        [InlineData(2,5)]
        [InlineData(3,4)]
        [InlineData(10,1)]
        [InlineData(11,1)]
        public void ChunkingWorks(int chunkSize, int expectedCount)
        {
            var array = Enumerable.Range(1,10);

            var chunkedArray = array.Chunk(chunkSize);

            Assert.Equal(chunkedArray.Count(), expectedCount);
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(0)]
        public void ChunkingDoesntWork(int chunkSize)
        {
            var array = Enumerable.Range(1, 10);

            Assert.Throws<ArgumentException>(()=> {
                array.Chunk(chunkSize);
            });
        }
    }
}
